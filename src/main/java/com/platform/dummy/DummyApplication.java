package com.platform.dummy;

import com.platform.dummy.multipleLicenses.MultipleLicensesRepository;
import com.platform.dummy.licenses.LicenseRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
//@CrossOrigin(origins = "https://dummy-front-ace8d7bf3875.herokuapp.com")
@CrossOrigin(origins = "http://localhost:4200")

class DummyApplication {

    private final LicenseRepository licenseRepository;
    private final MultipleLicensesRepository multipleLicenseesRepository;

    public DummyApplication(LicenseRepository licenseRepository, MultipleLicensesRepository multipleLicenseesRepository) {
        this.licenseRepository = licenseRepository;
        this.multipleLicenseesRepository = multipleLicenseesRepository;
    }

    public static void main(String[] args) {
        SpringApplication.run(DummyApplication.class, args);
    }


}