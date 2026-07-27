package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.PodDocumentResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Component
public class PodPdfRenderer {

    private static final float MARGIN = 42F;
    private static final float HEADER_HEIGHT = 132F;
    private static final float FIELD_GAP = 14F;
    private static final PDType1Font REGULAR_FONT =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA
            );
    private static final PDType1Font BOLD_FONT =
            new PDType1Font(
                    Standard14Fonts.FontName.HELVETICA_BOLD
            );

    public byte[] render(
            ShipmentPodService.PodDocumentContent content
    ) {
        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {
            for (
                    ShipmentPodService.PodContent pod
                    : content.pods()
            ) {
                addPage(
                        document,
                        content.document(),
                        pod
                );
            }

            document.save(output);

            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to render the POD PDF.",
                    exception
            );
        }
    }

    private void addPage(
            PDDocument document,
            PodDocumentResponse podDocument,
            ShipmentPodService.PodContent pod
    ) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        PDImageXObject image =
                PDImageXObject
                        .createFromByteArray(
                                document,
                                pod.content(),
                                "pod-" + pod.position()
                        );

        try (
                PDPageContentStream stream =
                        new PDPageContentStream(
                                document,
                                page
                        )
        ) {
            float y = page
                    .getMediaBox()
                    .getHeight()
                    - MARGIN;

            if (pod.position() == 1) {
                y = writeLine(
                        stream,
                        "Proof of Delivery",
                        18,
                        y
                );
                y = writeFieldsLine(
                        stream,
                        11,
                        y,
                        new MetadataField(
                                "Client",
                                podDocument.client()
                        ),
                        new MetadataField(
                                "Tracking code",
                                podDocument.trackingCode()
                        )
                );
                y = writeFieldsLine(
                        stream,
                        11,
                        y,
                        new MetadataField(
                                "Destination",
                                podDocument.destination()
                        ),
                        new MetadataField(
                                "Dispatch date",
                                String.valueOf(
                                        podDocument.dispatchDate()
                                )
                        )
                );
                y = writeFieldsLine(
                        stream,
                        11,
                        y,
                        new MetadataField(
                                "Status",
                                podDocument.status()
                        ),
                        new MetadataField(
                                "Status date",
                                String.valueOf(
                                        podDocument.statusDate()
                                )
                        )
                );
                y = writeFieldsLine(
                        stream,
                        11,
                        y,
                        new MetadataField(
                                "Generated at",
                                DateTimeFormatter.ISO_INSTANT
                                        .format(
                                                podDocument.generatedAt()
                                        )
                        )
                );
            } else {
                y = writeFieldsLine(
                        stream,
                        13,
                        y,
                        new MetadataField(
                                "Tracking code",
                                podDocument.trackingCode()
                        ),
                        new MetadataField(
                                "Status date",
                                String.valueOf(
                                        podDocument.statusDate()
                                )
                        )
                );
            }

            float imageTop =
                    Math.min(
                            y - 18F,
                            page.getMediaBox().getHeight()
                                    - MARGIN
                                    - HEADER_HEIGHT
                    );

            float availableWidth =
                    page.getMediaBox().getWidth()
                            - 2 * MARGIN;
            float availableHeight =
                    imageTop - MARGIN;

            float scale =
                    Math.min(
                            availableWidth
                                    / image.getWidth(),
                            availableHeight
                                    / image.getHeight()
                    );

            float imageWidth =
                    image.getWidth() * scale;
            float imageHeight =
                    image.getHeight() * scale;
            float x =
                    MARGIN
                            + (availableWidth - imageWidth)
                            / 2F;
            float imageY =
                    MARGIN
                            + (availableHeight - imageHeight)
                            / 2F;

            stream.drawImage(
                    image,
                    x,
                    imageY,
                    imageWidth,
                    imageHeight
            );
        }
    }

    private float writeLine(
            PDPageContentStream stream,
            String value,
            int fontSize,
            float y
    ) throws IOException {
        stream.beginText();
        stream.setFont(
                REGULAR_FONT,
                fontSize
        );
        stream.newLineAtOffset(MARGIN, y);
        stream.showText(value);
        stream.endText();

        return y - fontSize - 7F;
    }

    private float writeFieldsLine(
            PDPageContentStream stream,
            int fontSize,
            float y,
            MetadataField... fields
    ) throws IOException {
        float availableWidth =
                PDRectangle.A4.getWidth()
                        - 2 * MARGIN;
        int columnCount =
                fields.length == 1
                        ? 1
                        : 2;
        float columnWidth =
                (
                        availableWidth
                                - FIELD_GAP
                                * (columnCount - 1)
                )
                        / columnCount;

        for (int index = 0; index < fields.length; index++) {
            MetadataField field = fields[index];
            float x =
                    MARGIN
                            + index
                            * (columnWidth + FIELD_GAP);

            writeField(
                    stream,
                    field,
                    fontSize,
                    x,
                    y
            );
        }

        return y - fontSize - 7F;
    }

    private void writeField(
            PDPageContentStream stream,
            MetadataField field,
            int fontSize,
            float x,
            float y
    ) throws IOException {
        String label = field.label() + ": ";
        String value =
                field.value() == null
                        ? ""
                        : field.value();

        stream.beginText();
        stream.newLineAtOffset(x, y);
        stream.setFont(BOLD_FONT, fontSize);
        stream.showText(label);
        stream.setFont(REGULAR_FONT, fontSize);
        stream.showText(value);
        stream.endText();
    }

    private record MetadataField(
            String label,
            String value
    ) {
    }
}
