package com.aditya.DMS.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
public class RagDatabaseConfig {

    @Value("${rag.datasource.url}")
    private String url;

    @Value("${rag.datasource.username}")
    private String username;

    @Value("${rag.datasource.password}")
    private String password;

    @Bean(name = "ragDataSource")
    public DataSource ragDataSource() {

        DriverManagerDataSource dataSource =
                new DriverManagerDataSource();

        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);

        return dataSource;
    }

    @Bean(name = "ragJdbcTemplate")
    public JdbcTemplate ragJdbcTemplate(
            @Qualifier("ragDataSource") DataSource dataSource) {

        return new JdbcTemplate(dataSource);
    }
}