package com.example.rag_mvp.repository;

import com.example.rag_mvp.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrgRepository extends JpaRepository<Organization,Long> {
    Optional<Organization> findByOrgEmail(String orgEmail);
}

