package com.parcelshipping.shipments.seed;

import com.parcelshipping.shipments.domain.ProofOfDeliveryStatus;
import com.parcelshipping.shipments.domain.Shipment;
import com.parcelshipping.shipments.domain.ShipmentPod;
import com.parcelshipping.shipments.integration.pod.PodGenerationRequest;
import com.parcelshipping.shipments.integration.pod.PodGeneratorClient;
import com.parcelshipping.shipments.repository.ShipmentPodRepository;
import com.parcelshipping.shipments.storage.ShipmentPodStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShipmentPodSeedService {

    private static final int MINIMUM_POD_COUNT = 1;
    private static final int MAXIMUM_POD_COUNT = 3;

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    ShipmentPodSeedService.class
            );

    private final ShipmentPodRepository
            shipmentPodRepository;

    private final PodGeneratorClient
            podGeneratorClient;

    private final ShipmentPodStorage
            shipmentPodStorage;

    public ShipmentPodSeedService(
            ShipmentPodRepository shipmentPodRepository,
            PodGeneratorClient podGeneratorClient,
            ShipmentPodStorage shipmentPodStorage
    ) {
        this.shipmentPodRepository =
                shipmentPodRepository;

        this.podGeneratorClient =
                podGeneratorClient;

        this.shipmentPodStorage =
                shipmentPodStorage;
    }

    public void seed(
            Shipment shipment,
            int targetCount
    ) {
        validateShipment(
                shipment
        );

        validateTargetCount(
                targetCount
        );

        List<ShipmentPod> existingPods =
                shipmentPodRepository
                        .findAllByShipmentIdOrderByPositionAsc(
                                shipment.getId()
                        );

        Map<Integer, ShipmentPod>
                podsByPosition =
                indexByPosition(
                        existingPods,
                        shipment
                );

        int highestExistingPosition =
                podsByPosition
                        .keySet()
                        .stream()
                        .mapToInt(
                                Integer::intValue
                        )
                        .max()
                        .orElse(0);

        /*
         * Le seed ne supprime jamais un POD existant.
         *
         * Exemple :
         * - cible pseudo-aléatoire actuelle : 2
         * - POD existants : positions 1, 2 et 3
         *
         * La cible effective reste 3.
         */
        int effectiveTargetCount =
                Math.max(
                        targetCount,
                        highestExistingPosition
                );

        if (
                effectiveTargetCount
                        > MAXIMUM_POD_COUNT
        ) {
            throw new IllegalStateException(
                    "Shipment "
                            + shipment.getTrackingCode()
                            + " has a POD position exceeding "
                            + MAXIMUM_POD_COUNT
                            + "."
            );
        }

        for (
                int position =
                        MINIMUM_POD_COUNT;

                position <=
                        effectiveTargetCount;

                position++
        ) {
            ShipmentPod existingPod =
                    podsByPosition.get(
                            position
                    );

            seedPosition(
                    shipment,
                    position,
                    existingPod
            );
        }
    }

    private void seedPosition(
            Shipment shipment,
            int position,
            ShipmentPod existingPod
    ) {
        String storageKey =
                existingPod == null
                        ? shipmentPodStorage
                        .createStorageKey(
                                shipment.getId(),
                                position
                        )
                        : existingPod
                        .getStorageKey();

        /*
         * Ligne et fichier présents :
         * aucune génération supplémentaire.
         */
        if (
                existingPod != null
                        && shipmentPodStorage
                        .exists(storageKey)
        ) {
            LOGGER.debug(
                    "POD {} already exists for shipment {}.",
                    position,
                    shipment.getTrackingCode()
            );

            return;
        }

        byte[] pngContent =
                generatePod(
                        shipment,
                        position
                );

        shipmentPodStorage.write(
                storageKey,
                pngContent
        );

        /*
         * La ligne existe mais le fichier avait disparu :
         * seul le PNG est recréé.
         */
        if (existingPod != null) {
            LOGGER.info(
                    "Recreated missing POD file {} for shipment {}.",
                    position,
                    shipment.getTrackingCode()
            );

            return;
        }

        ShipmentPod newPod =
                ShipmentPod.create(
                        shipment.getId(),
                        position,
                        storageKey,
                        Instant.now()
                );

        try {
            shipmentPodRepository
                    .saveAndFlush(
                            newPod
                    );
        } catch (
                DataIntegrityViolationException exception
        ) {
            if (
                    isValidConcurrentCreation(
                            shipment,
                            position,
                            storageKey
                    )
            ) {
                LOGGER.info(
                        "POD {} for shipment {} was created concurrently.",
                        position,
                        shipment.getTrackingCode()
                );

                return;
            }

            shipmentPodStorage
                    .deleteIfExists(
                            storageKey
                    );

            throw exception;
        } catch (RuntimeException exception) {
            /*
             * La ligne n'a pas été persistée :
             * le fichier nouvellement créé ne doit pas
             * rester orphelin.
             */
            shipmentPodStorage
                    .deleteIfExists(
                            storageKey
                    );

            throw exception;
        }

        LOGGER.info(
                "Seeded POD {} for shipment {}.",
                position,
                shipment.getTrackingCode()
        );
    }

    private boolean isValidConcurrentCreation(
            Shipment shipment,
            int position,
            String storageKey
    ) {
        return shipmentPodRepository
                .findByShipmentIdAndPosition(
                        shipment.getId(),
                        position
                )
                .filter(pod -> storageKey.equals(
                        pod.getStorageKey()
                ))
                .filter(pod -> shipmentPodStorage
                        .exists(
                                pod.getStorageKey()
                        ))
                .isPresent();
    }

    private byte[] generatePod(
            Shipment shipment,
            int position
    ) {
        PodGenerationRequest request =
                new PodGenerationRequest(
                        shipment.getTrackingCode(),
                        shipment.getClient(),
                        shipment.getDestination(),
                        shipment.getDispatchDate(),
                        shipment.getStatusDate(),
                        position
                );

        return podGeneratorClient
                .generate(request);
    }

    private Map<Integer, ShipmentPod>
    indexByPosition(
            List<ShipmentPod> pods,
            Shipment shipment
    ) {
        Map<Integer, ShipmentPod> result =
                new HashMap<>();

        for (ShipmentPod pod : pods) {
            validateExistingPosition(
                    pod,
                    shipment
            );

            ShipmentPod duplicate =
                    result.putIfAbsent(
                            pod.getPosition(),
                            pod
                    );

            if (duplicate != null) {
                throw new IllegalStateException(
                        "Duplicate POD position "
                                + pod.getPosition()
                                + " for shipment "
                                + shipment
                                .getTrackingCode()
                                + "."
                );
            }
        }

        return result;
    }

    private void validateShipment(
            Shipment shipment
    ) {
        if (shipment == null) {
            throw new IllegalArgumentException(
                    "shipment is required."
            );
        }

        if (
                shipment.getProofOfDelivery()
                        != ProofOfDeliveryStatus.AVAILABLE
        ) {
            throw new IllegalStateException(
                    "Cannot seed POD files for shipment "
                            + shipment.getTrackingCode()
                            + " because its POD status is not AVAILABLE."
            );
        }
    }

    private void validateTargetCount(
            int targetCount
    ) {
        if (
                targetCount
                        < MINIMUM_POD_COUNT
                        || targetCount
                        > MAXIMUM_POD_COUNT
        ) {
            throw new IllegalArgumentException(
                    "targetCount must be between "
                            + MINIMUM_POD_COUNT
                            + " and "
                            + MAXIMUM_POD_COUNT
                            + "."
            );
        }
    }

    private void validateExistingPosition(
            ShipmentPod pod,
            Shipment shipment
    ) {
        if (
                pod.getPosition()
                        < MINIMUM_POD_COUNT
                        || pod.getPosition()
                        > MAXIMUM_POD_COUNT
        ) {
            throw new IllegalStateException(
                    "Invalid POD position "
                            + pod.getPosition()
                            + " for shipment "
                            + shipment
                            .getTrackingCode()
                            + "."
            );
        }
    }
}
