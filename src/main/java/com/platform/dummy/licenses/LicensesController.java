package com.platform.dummy.licenses;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/licenses")


public class LicensesController {
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private LicenseRepository licenseRepository;

    // Get all licenses
    @GetMapping
    public ResponseEntity<List<Licenses>> getData() {
        try {
            List<Licenses> licenseData = licenseRepository.findAll();
            return ResponseEntity.ok(licenseData);
        } catch (Exception e) {
            // Log the exception for debugging purposes
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // Get license by ID
    @GetMapping("/{id}")

    public ResponseEntity<Licenses> getLicenseById(@PathVariable("id") Long id) {
        Optional<Licenses> license = licenseRepository.findById(id);
        return license.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create a new license
    @PostMapping

    public ResponseEntity<Licenses> createLicense(@RequestBody Licenses license) {
        Licenses createdLicense = licenseRepository.save(license);
        return new ResponseEntity<>(createdLicense, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")

    public ResponseEntity<Licenses> updateLicense(
            @PathVariable("id") Long id,
            @RequestBody Licenses licenseDetails) {

        String comment = licenseDetails.getComment();

        Optional<Licenses> optionalLicense = licenseRepository.findById(id);
        if (optionalLicense.isPresent()) {
            Licenses existingLicense = optionalLicense.get();

            // Check if the current licensee is "Unknown" or if it's any other value
            if (existingLicense.getLicensee().equals("Unknown")) {
                // Update the licensee and set the modified column only if it's "Unknown"
                existingLicense.setLicensee(licenseDetails.getLicensee());
                existingLicense.setModified(String.valueOf(id)); // Set modified column
            } else {
                // Update the licensee for all other cases
                existingLicense.setLicensee(licenseDetails.getLicensee());
            }
            existingLicense.setComment(comment);


            // Save the updated license entity to the database
            Licenses updatedLicense = licenseRepository.save(existingLicense);

            return new ResponseEntity<>(updatedLicense, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }



    @PutMapping("/{id}/undo")
    public ResponseEntity<Licenses> undoUpdateLicensee(@PathVariable("id") Long id) {
        Optional<Licenses> optionalLicense = licenseRepository.findById(id);
        if (optionalLicense.isPresent()) {
            Licenses existingLicense = optionalLicense.get();

            // Revert the licensee field to "Unknown"
            existingLicense.setLicensee("Unknown");
            existingLicense.setModified(String.valueOf(id)); // Set modified column

            // Save the updated payment entity to the database
            Licenses updatedLicense  = licenseRepository.save(existingLicense);

            return ResponseEntity.ok(updatedLicense);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // Delete a license
    @DeleteMapping("/{id}")

    public ResponseEntity<HttpStatus> deleteLicense(@PathVariable("id") Long id) {
        try {
            licenseRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/mappingId")

    public ResponseEntity<Licenses> updateMappingId(
            @PathVariable("id") Long id,
            @RequestBody String mappingId) {
        Optional<Licenses> optionalLicense = licenseRepository.findById(id);
        if (optionalLicense.isPresent()) {
            Licenses existingLicense = optionalLicense.get();
            existingLicense.setMapping_id(mappingId);
            Licenses updatedLicense = licenseRepository.save(existingLicense);
            return new ResponseEntity<>(updatedLicense, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @DeleteMapping("/{id}/mapping_id")
    @Transactional
    public ResponseEntity<Void> deleteMappingId(@PathVariable Long id) {
        Licenses licenses = entityManager.find(Licenses.class, id);
        if (licenses != null) {
            licenses.setMapping_id(null); // Set mapping_id to null
            entityManager.merge(licenses);
            return ResponseEntity.noContent().build();
        } else {
            // Handle the case where the license with the given id is not found
            return ResponseEntity.notFound().build();
        }
    }
    @PutMapping("/{id}/details") // Adjust the mapping to match the correct URL
    public ResponseEntity<Licenses> updateDetails(
            @PathVariable("id") Long id,
            @RequestParam("details") String updatedDetails) {
        Optional<Licenses> optionalLicense = licenseRepository.findById(id);
        if (optionalLicense.isPresent()) {
            Licenses existingLicense = optionalLicense.get();
            existingLicense.setDetails(updatedDetails); // Set the updated details
            Licenses updatedLicense = licenseRepository.save(existingLicense);
            return new ResponseEntity<>(updatedLicense, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


}
