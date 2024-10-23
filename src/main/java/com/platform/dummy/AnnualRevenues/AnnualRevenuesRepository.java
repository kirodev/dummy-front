package com.platform.dummy.AnnualRevenues;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnualRevenuesRepository extends JpaRepository<AnnualRevenues, Integer> {
    AnnualRevenues findByLicensorAndYear(String licensor, int year);

}
