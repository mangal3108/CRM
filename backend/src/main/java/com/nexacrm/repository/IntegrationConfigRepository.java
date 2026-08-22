package com.nexacrm.repository;

import com.nexacrm.model.IntegrationConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IntegrationConfigRepository extends MongoRepository<IntegrationConfig, String> {
    Optional<IntegrationConfig> findByTenantIdAndIntegrationIdAndDeletedFalse(Long tenantId, String integrationId);
    List<IntegrationConfig> findByTenantIdAndDeletedFalse(Long tenantId);
    long countByTenantIdAndDeletedFalse(Long tenantId);

    // Webhooks arrive with no authenticated tenant — this looks up which tenant
    // owns a given WhatsApp phone number ID so inbound events route correctly.
    @Query("{ 'values.phoneNumberId' : ?0, 'integration_id' : 'whatsapp', 'deleted' : false }")
    Optional<IntegrationConfig> findByWhatsAppPhoneNumberIdAndDeletedFalse(String phoneNumberId);
}
