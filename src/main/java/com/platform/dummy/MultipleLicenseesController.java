package com.platform.dummy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/multiple-licensees")
public class MultipleLicenseesController {

    @Autowired
    private MultipleLicenseesRepository licenseesRepository;

    // Get all multiple licensees
    @GetMapping
    public ResponseEntity<List<MultipleLicensees>> getAllMultipleLicensees() {
        List<MultipleLicensees> multipleLicensees = licenseesRepository.findAll();
        return ResponseEntity.ok(multipleLicensees);
    }

    // Get multiple licensee by ID
    @GetMapping("/{id}")
    public ResponseEntity<MultipleLicensees> getMultipleLicenseeById(@PathVariable("id") Long id) {
        Optional<MultipleLicensees> multipleLicensee = licenseesRepository.findById(id);
        return multipleLicensee.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create a new multiple licensee
    @PostMapping
    public ResponseEntity<MultipleLicensees> createMultipleLicensee(@RequestBody MultipleLicensees multipleLicensee) {
        MultipleLicensees createdLicensee = licenseesRepository.save(multipleLicensee);
        return new ResponseEntity<>(createdLicensee, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/update-known-licensee")
    public ResponseEntity<Map<String, String>> updateKnownLicensee(@PathVariable Long id, @RequestBody String knownLicensee) {
        // Retrieve the entity by its ID
        MultipleLicensees licensees = licenseesRepository.findById(id).orElse(null);
        if (licensees != null) {
            // Reduce the integer in the multiplier field by 1
            if (licensees.getMultiplier() != null) {
                int newMultiplier = Math.max(0, licensees.getMultiplier() - 1); // Ensure multiplier is at least 0
                licensees.setMultiplier(newMultiplier);
            }

            // Update the knownLicensee field
            licensees.setKnownLicensee(knownLicensee);

            // Save the updated entity
            licenseesRepository.save(licensees);

            // Create a response JSON object
            Map<String, String> response = new HashMap<>();
            response.put("message", "Known licensee updated successfully");
            return ResponseEntity.ok(response);
        } else {
            // Create a response JSON object for not found case
            Map<String, String> response = new HashMap<>();
            response.put("error", "Multiple Licensee not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // Delete a multiple licensee
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteMultipleLicensee(@PathVariable("id") Long id) {
        try {
            licenseesRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
