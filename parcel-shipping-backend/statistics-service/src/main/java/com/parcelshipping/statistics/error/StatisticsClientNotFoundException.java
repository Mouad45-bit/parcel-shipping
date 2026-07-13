package com.parcelshipping.statistics.error;

public class StatisticsClientNotFoundException
        extends RuntimeException {

    public StatisticsClientNotFoundException(
            String client
    ) {
        super(
                "Statistics client not found: "
                        + client
        );
    }
}
