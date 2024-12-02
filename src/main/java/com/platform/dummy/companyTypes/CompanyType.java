package com.platform.dummy.companyTypes;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Column;

@Entity
@Table(name = "company_types") // Maps to the table name in your database
public class CompanyType {

    @Id
    @Column(name = "ID") // Maps to the 'ID' column
    private Long id;

    @Column(name = "Licensee") // Maps to the 'Licensee' column
    private String licensee;

    @Column(name = "Type") // Maps to the 'Type' column
    private String type;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLicensee() {
        return licensee;
    }

    public void setLicensee(String licensee) {
        this.licensee = licensee;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
