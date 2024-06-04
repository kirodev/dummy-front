package com.platform.dummy.licenses;


import javax.persistence.*;

@Entity
@Table(name = "existing_licenses")
public class Licenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)


    private Long id;

    private String licensor;
    private String licensee;
    private String snippet_id;

    private String affiliate;
    private String indication;
    private String signed_date;
    private String signed_year_quarter;
    private String expiration_date;
    private String expiration_year_quarter;
    private String payment_structure;

    private String information_type;
    private String _2G;
    private String _3G;
    private String _4G;
    private String _5G;
    private String _6G;
    private String wifi;
    private String technologies;

    private String geographical_scope;
    private String details;
    private String directory_path;
    private String document_date;
    private String comment;
    private String modified;
    private String mapping_id;



    public Licenses() {

    }

    public Licenses(Long id, String licensor, String licensee, String snippet_id, String affiliate, String indication, String signed_date, String signed_year_quarter, String expiration_date, String expiration_year_quarter, String payment_structure, String information_type, String _2G, String _3G, String _4G, String _5G, String _6G, String wifi, String technologies, String geographical_scope, String details, String directory_path, String document_date, String comment, String modified, String mapping_id) {
        this.id = id;
        this.licensor = licensor;
        this.licensee = licensee;
        this.snippet_id = snippet_id;
        this.affiliate = affiliate;
        this.indication = indication;
        this.signed_date = signed_date;
        this.signed_year_quarter = signed_year_quarter;
        this.expiration_date = expiration_date;
        this.expiration_year_quarter = expiration_year_quarter;
        this.payment_structure = payment_structure;
        this.information_type = information_type;
        this._2G = _2G;
        this._3G = _3G;
        this._4G = _4G;
        this._5G = _5G;
        this._6G = _6G;
        this.wifi = wifi;
        this.technologies = technologies;
        this.geographical_scope = geographical_scope;
        this.details = details;
        this.directory_path = directory_path;
        this.document_date = document_date;
        this.comment = comment;
        this.modified = modified;
        this.mapping_id = mapping_id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getSnippet_id() {
        return snippet_id;
    }

    public void setSnippet_id(String snippet_id) {
        this.snippet_id = snippet_id;
    }

    public String getAffiliate() {
        return affiliate;
    }

    public void setAffiliate(String affiliate) {
        this.affiliate = affiliate;
    }

    public String getIndication() {
        return indication;
    }

    public void setIndication(String indication) {
        this.indication = indication;
    }

    public String getSigned_date() {
        return signed_date;
    }

    public void setSigned_date(String signed_date) {
        this.signed_date = signed_date;
    }

    public String getSigned_year_quarter() {
        return signed_year_quarter;
    }

    public void setSigned_year_quarter(String signed_year_quarter) {
        this.signed_year_quarter = signed_year_quarter;
    }

    public String getExpiration_date() {
        return expiration_date;
    }

    public void setExpiration_date(String expiration_date) {
        this.expiration_date = expiration_date;
    }

    public String getExpiration_year_quarter() {
        return expiration_year_quarter;
    }

    public void setExpiration_year_quarter(String expiration_year_quarter) {
        this.expiration_year_quarter = expiration_year_quarter;
    }

    public String getPayment_structure() {
        return payment_structure;
    }

    public void setPayment_structure(String payment_structure) {
        this.payment_structure = payment_structure;
    }

    public String getInformation_type() {
        return information_type;
    }

    public void setInformation_type(String information_type) {
        this.information_type = information_type;
    }

    public String get_2G() {
        return _2G;
    }

    public void set_2G(String _2G) {
        this._2G = _2G;
    }

    public String get_3G() {
        return _3G;
    }

    public void set_3G(String _3G) {
        this._3G = _3G;
    }

    public String get_4G() {
        return _4G;
    }

    public void set_4G(String _4G) {
        this._4G = _4G;
    }

    public String get_5G() {
        return _5G;
    }

    public void set_5G(String _5G) {
        this._5G = _5G;
    }

    public String get_6G() {
        return _6G;
    }

    public void set_6G(String _6G) {
        this._6G = _6G;
    }

    public String getWifi() {
        return wifi;
    }

    public void setWifi(String wifi) {
        this.wifi = wifi;
    }

    public String getTechnologies() {
        return technologies;
    }

    public void setTechnologies(String technologies) {
        this.technologies = technologies;
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

    public String getDocument_date() {
        return document_date;
    }

    public void setDocument_date(String document_date) {
        this.document_date = document_date;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getModified() {
        return modified;
    }

    public void setModified(String modified) {
        this.modified = modified;
    }

    public String getMapping_id() {
        return mapping_id;
    }

    public void setMapping_id(String mapping_id) {
        this.mapping_id = mapping_id;
    }
}