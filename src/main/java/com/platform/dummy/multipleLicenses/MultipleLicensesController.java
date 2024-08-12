package com.platform.dummy.multipleLicenses;

import com.platform.dummy.licenses.Licenses;
import com.platform.dummy.multipleLicenses.MultipleLicenses;
import com.platform.dummy.multipleLicenses.MultipleLicensesRepository;
import com.platform.dummy.multiplePayments.MultiplePayments;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/multiple-licenses")

public class MultipleLicensesController {
    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private final MultipleLicensesRepository multiplelicensesRepository;

    public MultipleLicensesController(MultipleLicensesRepository multiplelicensesRepository) {
        this.multiplelicensesRepository = multiplelicensesRepository;
    }


    // Get all multiple licenses
    @GetMapping
    public ResponseEntity<List<MultipleLicenses>> getAllMultiplelicenses() {
        List<MultipleLicenses> multiplelicenses = multiplelicensesRepository.findAll();
        return ResponseEntity.ok(multiplelicenses);
    }

    // Get multiple license by ID
    @GetMapping("/{id}")
    public ResponseEntity<MultipleLicenses> getMultiplelicenseById(@PathVariable("id") Long id) {
        Optional<MultipleLicenses> multiplelicense = multiplelicensesRepository.findById(id);
        return multiplelicense.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create a new multiple license
    @PostMapping
    public ResponseEntity<MultipleLicenses> createMultiplelicense(@RequestBody MultipleLicenses multiplelicense) {
        MultipleLicenses createdlicense = multiplelicensesRepository.save(multiplelicense);
        return new ResponseEntity<>(createdlicense, HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    public ResponseEntity<MultipleLicenses> updateMultiplelicense(@PathVariable Long id, @RequestBody MultipleLicenses updatedMultiplelicenses) {
        Optional<MultipleLicenses> optionalMultipleLicenses = multiplelicensesRepository.findById(id);
        if (optionalMultipleLicenses.isPresent()) {
            MultipleLicenses existingMultiplelicenses = optionalMultipleLicenses.get();
    
            // If 'modified' is null or empty, set it to the current ID
            if (existingMultiplelicenses.getModified() == null || existingMultiplelicenses.getModified().isEmpty()) {
                existingMultiplelicenses.setModified(String.valueOf(id));
            }
    
            // Update the licensee field
            existingMultiplelicenses.setLicensee(updatedMultiplelicenses.getLicensee());
    
            // Update the multiplier
            Integer updatedMultiplier = updatedMultiplelicenses.getMultiplier();
            if (updatedMultiplier != null && updatedMultiplier > 0) {
                existingMultiplelicenses.setMultiplier(updatedMultiplier);
            }
    
            // Only update the comment if it's provided
            if (updatedMultiplelicenses.getComment() != null) {
                existingMultiplelicenses.setComment(updatedMultiplelicenses.getComment());
            }
    
            // Save the updated entity
            MultipleLicenses savedMultipleLicenses = multiplelicensesRepository.save(existingMultiplelicenses);
            return ResponseEntity.ok(savedMultipleLicenses);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    
    
    @PutMapping("/{id}/undo")
    public ResponseEntity<MultipleLicenses> undoUpdateMultiplelicense(@PathVariable("id") Long id) {
        Optional<MultipleLicenses> optionalLicense = multiplelicensesRepository.findById(id);
        if (optionalLicense.isPresent()) {
            MultipleLicenses existingLicense = optionalLicense.get();
    
            // Assuming 'modified' is a property in the MultipleLicenses entity
            String modifications = existingLicense.getModified();
    
            if (modifications != null && !modifications.isEmpty()) {
                // Split the modified field to extract snippet_id and row_id
                String[] parts = modifications.split("_");
                if (parts.length == 2) {
                    String snippetId = parts[0];
                    Long rowId = Long.valueOf(parts[1]);
    
                    // Find the original license row using the extracted coordinates
                    Optional<MultipleLicenses> originalLicenseOpt = multiplelicensesRepository.findById(rowId);
                    if (originalLicenseOpt.isPresent()) {
                        MultipleLicenses originalLicense = originalLicenseOpt.get();
    
                        // Update the licensee and multiplier of the original license row
                        String licensee = originalLicense.getLicensee();
    
                        // Remove the last value after the last " | " delimiter
                        int lastIndex = licensee.lastIndexOf(" | ");
                        if (lastIndex != -1) {
                            licensee = licensee.substring(0, lastIndex);
                        } else {
                            // If there's no " | " delimiter, set licensee to an empty string
                            licensee = "";
                        }
                        originalLicense.setLicensee(licensee);
    
                        // Increment the multiplier by 1 if it's not null
                        Integer multiplier = originalLicense.getMultiplier();
                        if (multiplier != null) {
                            originalLicense.setMultiplier(multiplier + 1);
                        }
    
                        // Set the 'modified' property to null
                        originalLicense.setModified(null);
    
                        // Save the updated license entity to the database
                        MultipleLicenses updatedLicense = multiplelicensesRepository.save(originalLicense);
                        return new ResponseEntity<>(updatedLicense, HttpStatus.OK);
                    }
                }
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    



    // Delete a multiple license
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteMultiplelicense(@PathVariable("id") Long id) {
        try {
            multiplelicensesRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping("/{id}/MLmappingId")
    public ResponseEntity<MultipleLicenses> updateMLMappingId(
            @PathVariable("id") Long id,
            @RequestBody String mappingId) {
        // Assuming MultipleLicensesRepository is autowired
        Optional<MultipleLicenses> optionalMultipleLicenses = multiplelicensesRepository.findById(id);
        if (optionalMultipleLicenses.isPresent()) {
            MultipleLicenses multipleLicenses = optionalMultipleLicenses.get();
            multipleLicenses.setMapping_id(mappingId); // Set the mapping ID
            // Save the updated entity
            MultipleLicenses updatedMultipleLicenses = multiplelicensesRepository.save(multipleLicenses);
            return new ResponseEntity<>(updatedMultipleLicenses, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/{id}/details") // Adjust the mapping to match the correct URL
    public ResponseEntity<MultipleLicenses> updateDetails(
            @PathVariable("id") Long id,
            @RequestParam("details") String updatedDetails) {
        Optional<MultipleLicenses> optionalMultipleLicenses = multiplelicensesRepository.findById(id);
        if (optionalMultipleLicenses.isPresent()) {
            MultipleLicenses multiplelicenses = optionalMultipleLicenses.get();
            multiplelicenses.setDetails(updatedDetails); // Set the updated details
            MultipleLicenses updatedLicense = multiplelicensesRepository.save(multiplelicenses);
            return new ResponseEntity<>(updatedLicense, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/mappingId")
    public ResponseEntity<List<String>> getAllMappingIds() {
        List<MultipleLicenses> allLicenses = multiplelicensesRepository.findAll();
        if (!allLicenses.isEmpty()) {
            List<String> mappingIds = allLicenses.stream()
                    .map(MultipleLicenses::getMapping_id)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(mappingIds);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}/mapping_id")
    @Transactional
    public ResponseEntity<Void> deleteMappingId(@PathVariable Long id) {
        MultipleLicenses multipleLicenses = entityManager.find(MultipleLicenses.class, id);
        if (multipleLicenses != null) {
            multipleLicenses.setMapping_id(null); // Set mapping_id to null
            entityManager.merge(multipleLicenses);
            return ResponseEntity.noContent().build();
        } else {
            // Handle the case where the license with the given id is not found
            return ResponseEntity.notFound().build();
        }
    }

}
