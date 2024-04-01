package com.platform.dummy;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MultipleLicenseesRepository extends JpaRepository<MultipleLicensees, Long> {
    // Find all MultipleLicensees
    List<MultipleLicensees> findAll();

    // Find MultipleLicensees by id
    MultipleLicensees findById(long id);

    // Save or update MultipleLicensees
    <S extends MultipleLicensees> S save(S multipleLicensees);

    // Delete MultipleLicensees by id
    void deleteById(long id);

    // Count the number of MultipleLicensees
    long count();

    // Check if MultipleLicensees with id exists
    boolean existsById(long id);

    // Delete MultipleLicensees
    void delete(MultipleLicensees multipleLicensees);

}
