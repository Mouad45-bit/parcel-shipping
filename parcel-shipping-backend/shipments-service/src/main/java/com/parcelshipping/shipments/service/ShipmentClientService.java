package com.parcelshipping.shipments.service;

import com.parcelshipping.shipments.api.dto.ShipmentClientListResponse;
import com.parcelshipping.shipments.api.dto.ShipmentClientResponse;
import com.parcelshipping.shipments.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ShipmentClientService {

    private final ShipmentRepository shipmentRepository;

    public ShipmentClientService(
            ShipmentRepository shipmentRepository
    ) {
        this.shipmentRepository =
                shipmentRepository;
    }

    @Transactional(readOnly = true)
    public ShipmentClientListResponse getClients() {
        List<ShipmentClientResponse> clients =
                shipmentRepository
                        .findDistinctClients()
                        .stream()
                        .map(client ->
                                new ShipmentClientResponse(
                                        client,
                                        formatClientLabel(client)
                                )
                        )
                        .toList();

        return new ShipmentClientListResponse(
                clients
        );
    }

    private String formatClientLabel(
            String client
    ) {
        return Arrays
                .stream(
                        client.split("[\\s_-]+")
                )
                .filter(part ->
                        !part.isBlank()
                )
                .map(this::capitalize)
                .collect(
                        Collectors.joining(" ")
                );
    }

    private String capitalize(
            String value
    ) {
        if (value.isEmpty()) {
            return value;
        }

        return value
                .substring(0, 1)
                .toUpperCase(Locale.ROOT)
                + value
                .substring(1)
                .toLowerCase(Locale.ROOT);
    }
}
