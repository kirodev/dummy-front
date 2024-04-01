package com.platform.dummy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LicenseRepository extends JpaRepository<Licenses, Long> {
    // Example of a custom query method
    List<Licenses> findByLicensee(String licensee);

    // Example of a JPQL query
    @Query("SELECT l FROM Licenses l WHERE l.licensee = :licensee")
    List<Licenses> findByLicenseeJPQL(@Param("licensee") String licensee);

    @Query("SELECT DISTINCT licensee FROM Licenses")
    List<String> findAllUniqueLicensees();

    // Find MultipleLicensees by id
    Licenses findById(long id);

    <S extends Licenses> S save(S Licenses);

    void deleteById(long id);

    long count();

    boolean existsById(long id);

    void delete(Licenses Licenses);
}
