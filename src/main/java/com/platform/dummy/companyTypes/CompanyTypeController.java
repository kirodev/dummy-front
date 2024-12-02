package com.platform.dummy.companyTypes;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class CompanyTypeController {

    private final CompanyTypeRepository companyTypeRepository;

    public CompanyTypeController(CompanyTypeRepository companyTypeRepository) {
        this.companyTypeRepository = companyTypeRepository;
    }

    @GetMapping("/company-types")
    public List<CompanyType> getAllCompanyTypes() {
        return companyTypeRepository.findAll();
    }
}
