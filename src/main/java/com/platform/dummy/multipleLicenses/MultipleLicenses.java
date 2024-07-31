package com.platform.dummy.multipleLicenses;
import javax.persistence.*;


@Entity
@Table(name = "multiple_licenses")
public class MultipleLicenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)


    private Long id;
    private String mapping_id;

    private String snippet_id;
    private String licensor;
    private String licensee;

    private String indiv_licensee;

    private String affiliate;
    private Integer multiplier;
    private String qualifiers;

    private String signed_date;
    private String signed_quarter;
    private String expiration_date;
    private String expiration_quarter;
    private String information_type;
    private String technologies;
    private String payment_structure;
    private String geographical_scope;
    private String details;
    private String directory_path;

    private String modified;
    private String comment;

    public MultipleLicenses(){

    }

    public MultipleLicenses(Long id, String mapping_id, String snippet_id, String licensor, String licensee, String indiv_licensee, String affiliate, Integer multiplier, String qualifiers, String signed_date, String signed_quarter, String expiration_date, String expiration_quarter, String information_type, String technologies, String payment_structure, String geographical_scope, String details, String directory_path, String modified, String comment) {
        this.id = id;
        this.mapping_id = mapping_id;
        this.snippet_id = snippet_id;
        this.licensor = licensor;
        this.licensee = licensee;
        this.indiv_licensee = indiv_licensee;
        this.affiliate = affiliate;
        this.multiplier = multiplier;
        this.qualifiers = qualifiers;
        this.signed_date = signed_date;
        this.signed_quarter = signed_quarter;
        this.expiration_date = expiration_date;
        this.expiration_quarter = expiration_quarter;
        this.information_type = information_type;
        this.technologies = technologies;
        this.payment_structure = payment_structure;
        this.geographical_scope = geographical_scope;
        this.details = details;
        this.directory_path = directory_path;
        this.modified = modified;
        this.comment = comment;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMapping_id() {
        return mapping_id;
    }

    public void setMapping_id(String mapping_id) {
        this.mapping_id = mapping_id;
    }

    public String getSnippet_id() {
        return snippet_id;
    }

    public void setSnippet_id(String snippet_id) {
        this.snippet_id = snippet_id;
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

    public String getIndiv_licensee() {
        return indiv_licensee;
    }

    public void setIndiv_licensee(String indiv_licensee) {
        this.indiv_licensee = indiv_licensee;
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

    public String getSigned_date() {
        return signed_date;
    }

    public void setSigned_date(String signed_date) {
        this.signed_date = signed_date;
    }

    public String getSigned_quarter() {
        return signed_quarter;
    }

    public void setSigned_quarter(String signed_quarter) {
        this.signed_quarter = signed_quarter;
    }

    public String getExpiration_date() {
        return expiration_date;
    }

    public void setExpiration_date(String expiration_date) {
        this.expiration_date = expiration_date;
    }

    public String getExpiration_quarter() {
        return expiration_quarter;
    }

    public void setExpiration_quarter(String expiration_quarter) {
        this.expiration_quarter = expiration_quarter;
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

    public String getPayment_structure() {
        return payment_structure;
    }

    public void setPayment_structure(String payment_structure) {
        this.payment_structure = payment_structure;
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

    public String getDirectory_path() {
        return directory_path;
    }

    public void setDirectory_path(String directory_path) {
        this.directory_path = directory_path;
    }

    public String getModified() {
        return modified;
    }

    public void setModified(String modified) {
        this.modified = modified;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}