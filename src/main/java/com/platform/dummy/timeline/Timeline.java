package com.platform.dummy.timeline;


import javax.persistence.*;

@Entity
@Table(name = "timeline")
public class Timeline {
    @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)


        private Long id;
        private Long snippet_idl;
        private Long snippet_idp;
        private String pair;
        private String licensor;
        private String licensee;
        private String signed_date;
        private String expiration_date;
        private String date_type;
        private String _2g;
        private String _3g;
        private String _4g;
        private String _5g;
        private String _6g;
        private String wifi;




    public Timeline() {

        }

    public Timeline(Long id, Long snippet_idl, Long snippet_idp, String pair, String licensor, String licensee, String signed_date, String expiration_date, String date_type, String _2g, String _3g, String _4g, String _5g, String _6g, String wifi) {
        this.id = id;
        this.snippet_idl = snippet_idl;
        this.snippet_idp = snippet_idp;
        this.pair = pair;
        this.licensor = licensor;
        this.licensee = licensee;
        this.signed_date = signed_date;
        this.expiration_date = expiration_date;
        this.date_type = date_type;
        this._2g = _2g;
        this._3g = _3g;
        this._4g = _4g;
        this._5g = _5g;
        this._6g = _6g;
        this.wifi = wifi;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSnippet_idl() {
        return snippet_idl;
    }

    public void setSnippet_idl(Long snippet_idl) {
        this.snippet_idl = snippet_idl;
    }

    public Long getSnippet_idp() {
        return snippet_idp;
    }

    public void setSnippet_idp(Long snippet_idp) {
        this.snippet_idp = snippet_idp;
    }

    public String getPair() {
        return pair;
    }

    public void setPair(String pair) {
        this.pair = pair;
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

    public String getSigned_date() {
        return signed_date;
    }

    public void setSigned_date(String signed_date) {
        this.signed_date = signed_date;
    }

    public String getExpiration_date() {
        return expiration_date;
    }

    public void setExpiration_date(String expiration_date) {
        this.expiration_date = expiration_date;
    }

    public String getDate_type() {
        return date_type;
    }

    public void setDate_type(String date_type) {
        this.date_type = date_type;
    }

    public String get_2g() {
        return _2g;
    }

    public void set_2g(String _2g) {
        this._2g = _2g;
    }

    public String get_3g() {
        return _3g;
    }

    public void set_3g(String _3g) {
        this._3g = _3g;
    }

    public String get_4g() {
        return _4g;
    }

    public void set_4g(String _4g) {
        this._4g = _4g;
    }

    public String get_5g() {
        return _5g;
    }

    public void set_5g(String _5g) {
        this._5g = _5g;
    }

    public String get_6g() {
        return _6g;
    }

    public void set_6g(String _6g) {
        this._6g = _6g;
    }

    public String getWifi() {
        return wifi;
    }

    public void setWifi(String wifi) {
        this.wifi = wifi;
    }
}