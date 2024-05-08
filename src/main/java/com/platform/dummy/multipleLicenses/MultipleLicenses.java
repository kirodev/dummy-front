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
    private String affiliate;
    private Integer multiplier;
    private String qualifiers;

    private String signed_date;
    private String signed_quarter;
    private String expiration_date;
    private String expiration_quarter;
    private String information_type;
    private String technologies;
    private String payment_amount;
    private String payment_type;
    private String geographical_scope;
    private String details;
    private String directory_path;

    private String modified;
    private String comment;

    public MultipleLicenses(){

    }

    public MultipleLicenses(Long id, String mapping_id, String snippet_id, String licensor, String licensee, String affiliate, Integer multiplier, String qualifiers, String signed_date, String signed_quarter, String expiration_date, String expiration_quarter, String information_type, String technologies, String payment_amount, String payment_type, String geographical_scope, String details, String directory_path, String modified, String comment) {
        this.id = id;
        this.mapping_id = mapping_id;
        this.snippet_id = snippet_id;
        this.licensor = licensor;
        this.licensee = licensee;
        this.affiliate = affiliate;
        this.multiplier = multiplier;
        this.qualifiers = qualifiers;
        this.signed_date = signed_date;
        this.signed_quarter = signed_quarter;
        this.expiration_date = expiration_date;
        this.expiration_quarter = expiration_quarter;
        this.information_type = information_type;
        this.technologies = technologies;
        this.payment_amount = payment_amount;
        this.payment_type = payment_type;
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

    @Override
    public String toString() {
        return "MultipleLicenses{" +
                "id=" + id +
                ", mapping_id='" + mapping_id + '\'' +
                ", snippet_id='" + snippet_id + '\'' +
                ", licensor='" + licensor + '\'' +
                ", licensee='" + licensee + '\'' +
                ", affiliate='" + affiliate + '\'' +
                ", multiplier=" + multiplier +
                ", qualifiers='" + qualifiers + '\'' +
                ", signed_date='" + signed_date + '\'' +
                ", signed_quarter='" + signed_quarter + '\'' +
                ", expiration_date='" + expiration_date + '\'' +
                ", expiration_quarter='" + expiration_quarter + '\'' +
                ", information_type='" + information_type + '\'' +
                ", technologies='" + technologies + '\'' +
                ", payment_amount='" + payment_amount + '\'' +
                ", payment_type='" + payment_type + '\'' +
                ", geographical_scope='" + geographical_scope + '\'' +
                ", details='" + details + '\'' +
                ", directory_path='" + directory_path + '\'' +
                ", modified='" + modified + '\'' +
                ", comment='" + comment + '\'' +
                '}';
    }
}