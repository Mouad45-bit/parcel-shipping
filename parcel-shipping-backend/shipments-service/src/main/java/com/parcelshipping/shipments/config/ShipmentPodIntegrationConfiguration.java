package com.parcelshipping.shipments.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({
        PodGeneratorProperties.class,
        ShipmentStorageProperties.class,
        ShipmentPodSeedProperties.class
})
public class ShipmentPodIntegrationConfiguration {

    @Bean
    public RestClient podGeneratorRestClient(
            RestClient.Builder builder,
            PodGeneratorProperties properties
    ) {
        SimpleClientHttpRequestFactory
                requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(
                properties.connectTimeout()
        );

        requestFactory.setReadTimeout(
                properties.readTimeout()
        );

        return builder
                .baseUrl(
                        properties
                                .baseUrl()
                                .toString()
                )
                .requestFactory(
                        requestFactory
                )
                .build();
    }
}
