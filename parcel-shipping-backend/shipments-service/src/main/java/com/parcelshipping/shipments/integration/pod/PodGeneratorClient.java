package com.parcelshipping.shipments.integration.pod;

import com.parcelshipping.shipments.error.PodGenerationException;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;

@Component
public class PodGeneratorClient {

    private static final int MAXIMUM_IMAGE_SIZE =
            10 * 1024 * 1024;

    private static final byte[] PNG_SIGNATURE = {
            (byte) 0x89,
            0x50,
            0x4E,
            0x47,
            0x0D,
            0x0A,
            0x1A,
            0x0A
    };

    private final RestClient restClient;

    public PodGeneratorClient(
            RestClient podGeneratorRestClient
    ) {
        this.restClient =
                podGeneratorRestClient;
    }

    public byte[] generate(
            PodGenerationRequest request
    ) {
        try {
            ResponseEntity<byte[]> response =
                    restClient
                            .post()
                            .uri(
                                    "/internal/pods/generate"
                            )
                            .contentType(
                                    MediaType.APPLICATION_JSON
                            )
                            .accept(
                                    MediaType.IMAGE_PNG
                            )
                            .body(request)
                            .retrieve()
                            .onStatus(
                                    HttpStatusCode::isError,
                                    (
                                            httpRequest,
                                            httpResponse
                                    ) -> {
                                        throw new PodGenerationException(
                                                "POD generator returned HTTP "
                                                        + httpResponse
                                                        .getStatusCode()
                                                        .value()
                                                        + "."
                                        );
                                    }
                            )
                            .toEntity(
                                    byte[].class
                            );

            validateResponse(response);

            return response.getBody();
        } catch (
                PodGenerationException exception
        ) {
            throw exception;
        } catch (
                RestClientException exception
        ) {
            throw new PodGenerationException(
                    "Unable to call the POD generator.",
                    exception
            );
        }
    }

    private void validateResponse(
            ResponseEntity<byte[]> response
    ) {
        MediaType contentType =
                response
                        .getHeaders()
                        .getContentType();

        if (
                contentType == null
                        || !MediaType
                        .IMAGE_PNG
                        .isCompatibleWith(
                                contentType
                        )
        ) {
            throw new PodGenerationException(
                    "POD generator returned an invalid content type."
            );
        }

        byte[] body = response.getBody();

        if (
                body == null
                        || body.length
                        < PNG_SIGNATURE.length
        ) {
            throw new PodGenerationException(
                    "POD generator returned an empty or invalid image."
            );
        }

        if (
                body.length >
                        MAXIMUM_IMAGE_SIZE
        ) {
            throw new PodGenerationException(
                    "Generated POD image exceeds the allowed size."
            );
        }

        byte[] signature =
                Arrays.copyOf(
                        body,
                        PNG_SIGNATURE.length
                );

        if (
                !Arrays.equals(
                        signature,
                        PNG_SIGNATURE
                )
        ) {
            throw new PodGenerationException(
                    "POD generator response is not a valid PNG file."
            );
        }
    }
}
