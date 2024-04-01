package com.platform.dummy;

import jakarta.persistence.*;

@Entity
@Table(name = "existing_licenses")
public class Licenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)


    private Long id;
    private Long License_ID;
    private String licensor;
    private String licensee;
    private String Affiliate;
    private String indication;
    private String signed_date;
    private String signed_year_quarter;
    private String expiration_date;
    private String expiration_year_quarter;
    private String exist;
    private String exist_during_period_start_date;
    private String exist_during_period_end_date;
    private String Does_not_exist_period_start_date;
    private String Does_not_exist_period_end_date;
    private String Legal_action_period_start_date;
    private String Legal_action_period_end_date;
    private String information_type;
    private String _2G;
    private String _3G;
    private String _4G;
    private String _5G;
    private String _6G;
    private String wifi;
    private String other_technologies;
    private Float payment_amount;
    private String payment_type;
    private String geographical_scope;
    private String details;
    private String document_name;
    private String document_date;

    private String modified;

    public Licenses() {

    }
    @Override
    public Licenses clone() {
        try {
            return (Licenses) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException("Cloning not supported for Licenses");
        }
    }
    public Licenses(Long id, Long license_ID, String licensor, String licensee, String affiliate, String indication, String signed_date, String signed_year_quarter, String expiration_date, String expiration_year_quarter, String exist, String exist_during_period_start_date, String exist_during_period_end_date, String does_not_exist_period_start_date, String does_not_exist_period_end_date, String legal_action_period_start_date, String legal_action_period_end_date, String information_type, String _2G, String _3G, String _4G, String _5G, String _6G, String wifi, String other_technologies, Float payment_amount, String payment_type, String geographical_scope, String details, String document_name, String document_date, String modified) {
        this.id = id;
        License_ID = license_ID;
        this.licensor = licensor;
        this.licensee = licensee;
        Affiliate = affiliate;
        this.indication = indication;
        this.signed_date = signed_date;
        this.signed_year_quarter = signed_year_quarter;
        this.expiration_date = expiration_date;
        this.expiration_year_quarter = expiration_year_quarter;
        this.exist = exist;
        this.exist_during_period_start_date = exist_during_period_start_date;
        this.exist_during_period_end_date = exist_during_period_end_date;
        Does_not_exist_period_start_date = does_not_exist_period_start_date;
        Does_not_exist_period_end_date = does_not_exist_period_end_date;
        Legal_action_period_start_date = legal_action_period_start_date;
        Legal_action_period_end_date = legal_action_period_end_date;
        this.information_type = information_type;
        this._2G = _2G;
        this._3G = _3G;
        this._4G = _4G;
        this._5G = _5G;
        this._6G = _6G;
        this.wifi = wifi;
        this.other_technologies = other_technologies;
        this.payment_amount = payment_amount;
        this.payment_type = payment_type;
        this.geographical_scope = geographical_scope;
        this.details = details;
        this.document_name = document_name;
        this.document_date = document_date;
        this.modified = modified;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLicense_ID() {
        return License_ID;
    }

    public void setLicense_ID(Long license_ID) {
        License_ID = license_ID;
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
        return Affiliate;
    }

    public void setAffiliate(String affiliate) {
        Affiliate = affiliate;
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

    public String getexist() {
        return exist;
    }

    public void setexist(String exist) {
        this.exist = exist;
    }

    public String getexist_during_period_start_date() {
        return exist_during_period_start_date;
    }

    public void setexist_during_period_start_date(String exist_during_period_start_date) {
        this.exist_during_period_start_date = exist_during_period_start_date;
    }

    public String getexist_during_period_end_date() {
        return exist_during_period_end_date;
    }

    public void setexist_during_period_end_date(String exist_during_period_end_date) {
        this.exist_during_period_end_date = exist_during_period_end_date;
    }

    public String getDoes_not_exist_period_start_date() {
        return Does_not_exist_period_start_date;
    }

    public void setDoes_not_exist_period_start_date(String does_not_exist_period_start_date) {
        Does_not_exist_period_start_date = does_not_exist_period_start_date;
    }

    public String getDoes_not_exist_period_end_date() {
        return Does_not_exist_period_end_date;
    }

    public void setDoes_not_exist_period_end_date(String does_not_exist_period_end_date) {
        Does_not_exist_period_end_date = does_not_exist_period_end_date;
    }

    public String getLegal_action_period_start_date() {
        return Legal_action_period_start_date;
    }

    public void setLegal_action_period_start_date(String legal_action_period_start_date) {
        Legal_action_period_start_date = legal_action_period_start_date;
    }

    public String getLegal_action_period_end_date() {
        return Legal_action_period_end_date;
    }

    public void setLegal_action_period_end_date(String legal_action_period_end_date) {
        Legal_action_period_end_date = legal_action_period_end_date;
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

    public String getOther_technologies() {
        return other_technologies;
    }

    public void setOther_technologies(String other_technologies) {
        this.other_technologies = other_technologies;
    }

    public Float getPayment_amount() {
        return payment_amount;
    }

    public void setPayment_amount(Float payment_amount) {
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

    public String getDocument_date() {
        return document_date;
    }

    public void setDocument_date(String document_date) {
        this.document_date = document_date;
    }

    public String getmodified() {
        return modified;
    }

    public void setmodified(String modified) {
        this.modified = modified;
    }
}

