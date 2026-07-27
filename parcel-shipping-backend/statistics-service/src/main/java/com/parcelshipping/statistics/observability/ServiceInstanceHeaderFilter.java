package com.parcelshipping.statistics.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@ConditionalOnProperty(
        prefix = "load-balancing.observation",
        name = "enabled",
        havingValue = "true"
)
public class ServiceInstanceHeaderFilter extends OncePerRequestFilter {

    private static final String SERVICE_NAME_HEADER = "X-Service-Name";
    private static final String SERVICE_INSTANCE_HEADER = "X-Service-Instance";

    private final String serviceName;
    private final String serviceInstance;

    public ServiceInstanceHeaderFilter(
            @Value("${spring.application.name}") String serviceName,
            @Value("${eureka.instance.instance-id}") String serviceInstance
    ) {
        this.serviceName = serviceName;
        this.serviceInstance = serviceInstance;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        response.setHeader(SERVICE_NAME_HEADER, serviceName);
        response.setHeader(SERVICE_INSTANCE_HEADER, serviceInstance);

        filterChain.doFilter(request, response);
    }
}
