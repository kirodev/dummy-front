package com.platform.dummy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import com.platform.dummy.licenses.LicenseRepository;
import com.platform.dummy.multipleLicenses.MultipleLicensesRepository;

@SpringBootApplication
@RestController
//@CrossOrigin(origins = "https://dummy-front-ace8d7bf3875.herokuapp.com")
@CrossOrigin(origins = "http://localhost:4200")

class DummyApplication {

    public DummyApplication(LicenseRepository licenseRepository,
            MultipleLicensesRepository multipleLicenseesRepository) {
    }

    public static void main(String[] args) {
        SpringApplication.run(DummyApplication.class, args);
    }

}