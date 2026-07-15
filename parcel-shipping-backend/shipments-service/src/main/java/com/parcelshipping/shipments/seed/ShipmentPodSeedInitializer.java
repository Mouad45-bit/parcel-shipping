package com.parcelshipping.shipments.seed;

import com.parcelshipping.shipments.config.ShipmentPodSeedProperties;
import com.parcelshipping.shipments.domain.ProofOfDeliveryStatus;
import com.parcelshipping.shipments.domain.Shipment;
import com.parcelshipping.shipments.repository.ShipmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;

@Component
public class ShipmentPodSeedInitializer
        implements ApplicationRunner {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    ShipmentPodSeedInitializer.class
            );

    private final ShipmentPodSeedProperties properties;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentPodCountSelector countSelector;
    private final ShipmentPodSeedService seedService;

    public ShipmentPodSeedInitializer(
            ShipmentPodSeedProperties properties,
            ShipmentRepository shipmentRepository,
            ShipmentPodCountSelector countSelector,
            ShipmentPodSeedService seedService
    ) {
        this.properties = properties;
        this.shipmentRepository =
                shipmentRepository;
        this.countSelector = countSelector;
        this.seedService = seedService;
    }

    @Override
    public void run(
            ApplicationArguments arguments
    ) {
        if (!properties.enabled()) {
            LOGGER.info(
                    "Shipment POD seed is disabled."
            );

            return;
        }

        int pageNumber = 0;
        long processedCount = 0;
        long failureCount = 0;

        Slice<Shipment> shipmentSlice;

        do {
            shipmentSlice =
                    shipmentRepository
                            .findAllByProofOfDeliveryOrderByIdAsc(
                                    ProofOfDeliveryStatus.AVAILABLE,
                                    PageRequest.of(
                                            pageNumber,
                                            properties.batchSize()
                                    )
                            );

            for (
                    Shipment shipment
                    : shipmentSlice.getContent()
            ) {
                try {
                    int targetCount =
                            countSelector.selectCount(
                                    shipment.getId()
                            );

                    seedService.seed(
                            shipment,
                            targetCount
                    );

                    processedCount++;
                } catch (RuntimeException exception) {
                    failureCount++;

                    LOGGER.error(
                            "Unable to seed POD files for shipment {}.",
                            shipment.getTrackingCode(),
                            exception
                    );

                    if (properties.failFast()) {
                        throw exception;
                    }
                }
            }

            pageNumber++;
        } while (shipmentSlice.hasNext());

        LOGGER.info(
                "Shipment POD seed completed: "
                        + "processed={}, failures={}.",
                processedCount,
                failureCount
        );
    }
}
