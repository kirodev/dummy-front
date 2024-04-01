package com.platform.dummy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@SpringBootApplication
@RestController
@CrossOrigin(origins = "http://localhost:4200")
class SpringBootTutorialApplication {

    private final LicenseRepository licenseRepository;
    private final MultipleLicenseesRepository multipleLicenseesRepository;

    public SpringBootTutorialApplication(LicenseRepository licenseRepository, MultipleLicenseesRepository multipleLicenseesRepository) {
        this.licenseRepository = licenseRepository;
        this.multipleLicenseesRepository = multipleLicenseesRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(SpringBootTutorialApplication.class, args);
    }


}
