package com.platform.dummy.QuarterlyRevenues;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuarterlyRevenuesRepository extends JpaRepository<QuarterlyRevenues, Integer> {
    // Custom query methods (if any) can be defined here
}
