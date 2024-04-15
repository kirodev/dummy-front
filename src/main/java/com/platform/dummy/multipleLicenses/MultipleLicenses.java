package com.platform.dummy.multipleLicenses;
import jakarta.persistence.*;

//license_id	Licensor	licensee	affiliate	multiplier	qualifiers 	signed_date_start	signed_date_end	signed_year_quarter	expiration_date_start	expiration_date_end	expiration_year_quarter	information_type	technologies	payment_amount  (in thousands of US dollars)	payment_type	geographical_scope	details	document_name

@Entity
@Table(name = "multiple_licenses")
public class MultipleLicenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)


    private Long id;
    private String license_id;
    private String licensor;
    private String licensee;
    private String affiliate;
    private Integer multiplier;
    private String qualifiers;
    private String signed_date_start;
    private String signed_date_end;
    private String signed_year_quarter;
    private String expiration_date_start;
    private String expiration_date_end;
    private String expiration_year_quarter;
    private String information_type;
    private String technologies;
    private String payment_amount;
    private String payment_type;
    private String geographical_scope;
    private String details;
    private String document_name;

    private String modified;

    public MultipleLicenses(){

    }

    public MultipleLicenses(Long id, String license_id, String licensor, String licensee, String affiliate, Integer multiplier, String qualifiers, String signed_date_start, String signed_date_end, String signed_year_quarter, String expiration_date_start, String expiration_date_end, String expiration_year_quarter, String information_type, String technologies, String payment_amount, String payment_type, String geographical_scope, String details, String document_name, String modified) {
        this.id = id;
        this.license_id = license_id;
        this.licensor = licensor;
        this.licensee = licensee;
        this.affiliate = affiliate;
        this.multiplier = multiplier;
        this.qualifiers = qualifiers;
        this.signed_date_start = signed_date_start;
        this.signed_date_end = signed_date_end;
        this.signed_year_quarter = signed_year_quarter;
        this.expiration_date_start = expiration_date_start;
        this.expiration_date_end = expiration_date_end;
        this.expiration_year_quarter = expiration_year_quarter;
        this.information_type = information_type;
        this.technologies = technologies;
        this.payment_amount = payment_amount;
        this.payment_type = payment_type;
        this.geographical_scope = geographical_scope;
        this.details = details;
        this.document_name = document_name;
        this.modified = modified;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLicense_id() {
        return license_id;
    }

    public void setLicense_id(String license_id) {
        this.license_id = license_id;
    }

    public String getLicensor() {
        return licensor;
    }

    public void setLicensor(String licensor) {
        this.licensor = licensor;
    }

    public String getLicensee() {
        return licensee;
    }

    public void setLicensee(String licensee) {
        this.licensee = licensee;
    }

    public String getAffiliate() {
        return affiliate;
    }

    public void setAffiliate(String affiliate) {
        this.affiliate = affiliate;
    }

    public Integer getMultiplier() {
        return multiplier;
    }

    public void setMultiplier(Integer multiplier) {
        this.multiplier = multiplier;
    }

    public String getQualifiers() {
        return qualifiers;
    }

    public void setQualifiers(String qualifiers) {
        this.qualifiers = qualifiers;
    }

    public String getSigned_date_start() {
        return signed_date_start;
    }

    public void setSigned_date_start(String signed_date_start) {
        this.signed_date_start = signed_date_start;
    }

    public String getSigned_date_end() {
        return signed_date_end;
    }

    public void setSigned_date_end(String signed_date_end) {
        this.signed_date_end = signed_date_end;
    }

    public String getSigned_year_quarter() {
        return signed_year_quarter;
    }

    public void setSigned_year_quarter(String signed_year_quarter) {
        this.signed_year_quarter = signed_year_quarter;
    }

    public String getExpiration_date_start() {
        return expiration_date_start;
    }

    public void setExpiration_date_start(String expiration_date_start) {
        this.expiration_date_start = expiration_date_start;
    }

    public String getExpiration_date_end() {
        return expiration_date_end;
    }

    public void setExpiration_date_end(String expiration_date_end) {
        this.expiration_date_end = expiration_date_end;
    }

    public String getExpiration_year_quarter() {
        return expiration_year_quarter;
    }

    public void setExpiration_year_quarter(String expiration_year_quarter) {
        this.expiration_year_quarter = expiration_year_quarter;
    }

    public String getInformation_type() {
        return information_type;
    }

    public void setInformation_type(String information_type) {
        this.information_type = information_type;
    }

    public String getTechnologies() {
        return technologies;
    }

    public void setTechnologies(String technologies) {
        this.technologies = technologies;
    }

    public String getPayment_amount() {
        return payment_amount;
    }

    public void setPayment_amount(String payment_amount) {
        this.payment_amount = payment_amount;
    }

    public String getPayment_type() {
        return payment_type;
    }

    public void setPayment_type(String payment_type) {
        this.payment_type = payment_type;
    }

    public String getGeographical_scope() {
        return geographical_scope;
    }

    public void setGeographical_scope(String geographical_scope) {
        this.geographical_scope = geographical_scope;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getDocument_name() {
        return document_name;
    }

    public void setDocument_name(String document_name) {
        this.document_name = document_name;
    }

    public String getModified() {
        return modified;
    }

    public void setModified(String modified) {
        this.modified = modified;
    }
}