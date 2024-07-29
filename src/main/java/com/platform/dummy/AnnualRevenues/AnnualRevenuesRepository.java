package com.platform.dummy.AnnualRevenues;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnualRevenuesRepository extends JpaRepository<AnnualRevenues, Integer> {
    // Custom query methods (if any) can be defined here
}
