package com.platform.dummy.multiplePayments;

import com.platform.dummy.multipleLicenses.MultipleLicenses;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/multiple-payments")

public class MultiplePaymentsController {
    @PersistenceContext
    private EntityManager entityManager;
    private final MultiplePaymentsRepository multiplePaymentsRepository;

    @Autowired
    public MultiplePaymentsController(MultiplePaymentsRepository multiplePaymentsRepository) {
        this.multiplePaymentsRepository = multiplePaymentsRepository;
    }
    @GetMapping
    public ResponseEntity<List<MultiplePayments>> getAllMultiplePayments() {
        List<MultiplePayments> multiplepayments = multiplePaymentsRepository.findAll();
        return ResponseEntity.ok(multiplepayments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MultiplePayments> getMultiplePaymentById(@PathVariable Long id) {
        Optional<MultiplePayments> multiplePaymentsOptional = multiplePaymentsRepository.findById(id);
        return multiplePaymentsOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public MultiplePayments createMultiplePayment(@RequestBody MultiplePayments multiplePayments) {
        return multiplePaymentsRepository.save(multiplePayments);
    }

    @PutMapping("/{id}")
public ResponseEntity<MultiplePayments> updateMultiplePayment(@PathVariable Long id, @RequestBody MultiplePayments updatedMultiplePayments) {
    Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
    if (optionalMultiplePayments.isPresent()) {
        MultiplePayments existingMultiplePayments = optionalMultiplePayments.get();

        // Set modified with the ID
        existingMultiplePayments.setModified(String.valueOf(id));

        // Update the licensee field
        existingMultiplePayments.setLicensee(updatedMultiplePayments.getLicensee());

        // Update the multiplier
        Integer updatedMultiplier = updatedMultiplePayments.getMultiplier();
        if (updatedMultiplier != null) {
            existingMultiplePayments.setMultiplier(updatedMultiplier);
        } 
       

        // Only update the comment if it's provided
        if (updatedMultiplePayments.getComment() != null) {
            existingMultiplePayments.setComment(updatedMultiplePayments.getComment());
        }

        // Save the updated entity
        MultiplePayments savedMultiplePayments = multiplePaymentsRepository.save(existingMultiplePayments);
        return ResponseEntity.ok(savedMultiplePayments);
    } else {
        return ResponseEntity.notFound().build();
    }
}


@PutMapping("/{id}/undoP")
public ResponseEntity<MultiplePayments> undoUpdateMultiplePayment(@PathVariable("id") Long id) {
    Optional<MultiplePayments> optionalPayment = multiplePaymentsRepository.findById(id);
    if (optionalPayment.isPresent()) {
        MultiplePayments existingPayment = optionalPayment.get();

        // Assuming 'modified' is a property in the MultiplePayments entity
        String modifications = existingPayment.getModified();

        if (modifications != null && !modifications.isEmpty()) {
            // Split the modified field to extract snippet_id and row_id
            String[] parts = modifications.split("_");
            if (parts.length == 2) {
                String snippetId = parts[0];
                Long rowId = Long.valueOf(parts[1]);

                // Find the original payment row using the extracted coordinates
                Optional<MultiplePayments> originalPaymentOpt = multiplePaymentsRepository.findById(rowId);
                if (originalPaymentOpt.isPresent()) {
                    MultiplePayments originalPayment = originalPaymentOpt.get();

                    // Update the licensee and multiplier of the original payment row
                    String licensee = originalPayment.getLicensee();

                    // Remove the last value after the last " | " delimiter
                    int lastIndex = licensee.lastIndexOf(" | ");
                    if (lastIndex != -1) {
                        licensee = licensee.substring(0, lastIndex);
                    } else {
                        // If there's no " | " delimiter, set licensee to an empty string
                        licensee = "";
                    }
                    originalPayment.setLicensee(licensee);

                    // Increment the multiplier by 1 if it's not null
                    Integer multiplier = originalPayment.getMultiplier();
                    if (multiplier != null) {
                        originalPayment.setMultiplier(multiplier + 1);
                    }

                    // Set the 'modified' property to null
                    originalPayment.setModified(null);


                    // Save the updated payment entity to the database
                    MultiplePayments updatedPayment = multiplePaymentsRepository.save(originalPayment);

                    // Return the updated payment entity
                    return new ResponseEntity<>(updatedPayment, HttpStatus.OK);
                }
            }
        }
    }
    return ResponseEntity.notFound().build();
}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMultiplePayment(@PathVariable Long id) {
        Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
        if (optionalMultiplePayments.isPresent()) {
            multiplePaymentsRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/MPmappingId")
    public ResponseEntity<MultiplePayments> updateMPMappingId(
            @PathVariable("id") Long id,
            @RequestBody String mappingId) {
        // Assuming MultipleLicensesRepository is autowired
        Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
        if (optionalMultiplePayments.isPresent()) {
            MultiplePayments multiplePayments = optionalMultiplePayments.get();
            multiplePayments.setMapping_id(mappingId); // Set the mapping ID
            // Save the updated entity
            MultiplePayments updatedMultiplePayments = multiplePaymentsRepository.save(multiplePayments);
            return new ResponseEntity<>(updatedMultiplePayments, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/{id}/details") // Adjust the mapping to match the correct URL
    public ResponseEntity<MultiplePayments> updateDetails(
            @PathVariable("id") Long id,
            @RequestParam("details") String updatedDetails) {
        Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
        if (optionalMultiplePayments.isPresent()) {
            MultiplePayments multiplepayments = optionalMultiplePayments.get();
            multiplepayments.setDetails(updatedDetails); // Set the updated details
            MultiplePayments updatedPayments = multiplePaymentsRepository.save(multiplepayments);
            return new ResponseEntity<>(updatedPayments, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}/mapping_id")
    @Transactional
    public ResponseEntity<Void> deleteMappingId(@PathVariable Long id) {
        MultiplePayments multiplePayments = entityManager.find(MultiplePayments.class, id);
        if (multiplePayments != null) {
            multiplePayments.setMapping_id(null); // Set mapping_id to null
            entityManager.merge(multiplePayments);
            return ResponseEntity.noContent().build();
        } else {
            // Handle the case where the license with the given id is not found
            return ResponseEntity.notFound().build();
        }
    }

}
