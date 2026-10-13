package com.aiteammatcher.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String primaryUrl;

    @Value("${spring.datasource.username}")
    private String primaryUsername;

    @Value("${spring.datasource.password}")
    private String primaryPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String primaryDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        logger.info("Initializing DataSource. Configured primary JDBC URL: {}", primaryUrl);

        HikariConfig primaryConfig = new HikariConfig();
        primaryConfig.setJdbcUrl(primaryUrl);
        primaryConfig.setUsername(primaryUsername);
        primaryConfig.setPassword(primaryPassword);
        primaryConfig.setDriverClassName(primaryDriver);
        primaryConfig.setConnectionTimeout(4000);
        primaryConfig.setInitializationFailTimeout(1);
        primaryConfig.setMaximumPoolSize(10);
        primaryConfig.setMinimumIdle(2);

        try {
            HikariDataSource primaryDs = new HikariDataSource(primaryConfig);
            try (Connection conn = primaryDs.getConnection()) {
                logger.info("Successfully connected to primary MySQL database at {}", primaryUrl);
                return primaryDs;
            } catch (Exception ex) {
                logger.warn("Primary MySQL connection test failed ({}). Closing primary pool.", ex.getMessage());
                try {
                    primaryDs.close();
                } catch (Exception ignored) {
                }
            }
        } catch (Exception e) {
            logger.warn("Could not create primary MySQL DataSource ({}).", e.getMessage());
        }

        logger.warn("=================================================================================");
        logger.warn("PRIMARY MYSQL DATABASE UNREACHABLE (DNS NXDOMAIN or OFFLINE).");
        logger.warn("ACTIVATING RESILIENT PERSISTENT EMBEDDED DATABASE (MySQL MODE).");
        logger.warn("Application will remain 100% operational with registration, login, and team chat.");
        logger.warn("=================================================================================");

        File dataDir = new File("./data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }

        HikariConfig fallbackConfig = new HikariConfig();
        fallbackConfig.setJdbcUrl("jdbc:h2:file:./data/team_matcher;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
        fallbackConfig.setDriverClassName("org.h2.Driver");
        fallbackConfig.setUsername("sa");
        fallbackConfig.setPassword("");
        fallbackConfig.setConnectionTimeout(10000);
        fallbackConfig.setMaximumPoolSize(10);
        fallbackConfig.setMinimumIdle(2);

        return new HikariDataSource(fallbackConfig);
    }
}
