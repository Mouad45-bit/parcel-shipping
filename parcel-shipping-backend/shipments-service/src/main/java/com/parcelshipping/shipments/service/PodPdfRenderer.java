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
    private static final float HEADER_HEIGHT = 150F;

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
                y = writeLine(
                        stream,
                        "Client: " + podDocument.client(),
                        11,
                        y
                );
                y = writeLine(
                        stream,
                        "Generated at: "
                                + DateTimeFormatter.ISO_INSTANT
                                .format(
                                        podDocument.generatedAt()
                                ),
                        11,
                        y
                );
                y -= 8;
                y = writeLine(
                        stream,
                        "Tracking code: "
                                + podDocument.trackingCode(),
                        11,
                        y
                );
                y = writeLine(
                        stream,
                        "Destination: "
                                + podDocument.destination(),
                        11,
                        y
                );
                y = writeLine(
                        stream,
                        "Dispatch date: "
                                + podDocument.dispatchDate(),
                        11,
                        y
                );
                y = writeLine(
                        stream,
                        "Status: "
                                + podDocument.status(),
                        11,
                        y
                );
                y = writeLine(
                        stream,
                        "Status date: "
                                + podDocument.statusDate(),
                        11,
                        y
                );
            } else {
                y = writeLine(
                        stream,
                        "Tracking code: "
                                + podDocument.trackingCode(),
                        13,
                        y
                );
                y = writeLine(
                        stream,
                        "Status date: "
                                + podDocument.statusDate(),
                        11,
                        y
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
                new PDType1Font(
                        Standard14Fonts.FontName.HELVETICA
                ),
                fontSize
        );
        stream.newLineAtOffset(MARGIN, y);
        stream.showText(value);
        stream.endText();

        return y - fontSize - 7F;
    }
}
