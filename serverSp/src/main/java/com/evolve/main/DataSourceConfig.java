package com.evolve.main;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource getDataSource() {
        AwsSecretManager.DatabaseCredentials credentials = AwsSecretManager.getSecret();
        DataSourceBuilder<?> dataSourceBuilder = DataSourceBuilder.create();
        dataSourceBuilder.driverClassName("org.postgresql.Driver");
        dataSourceBuilder.url("jdbc:postgresql://evolve.cdmj9bdj1iv6.us-east-1.rds.amazonaws.com:5432/evolve");
        dataSourceBuilder.username(credentials.username);
        dataSourceBuilder.password(credentials.password);
        return dataSourceBuilder.build();
    }
}
