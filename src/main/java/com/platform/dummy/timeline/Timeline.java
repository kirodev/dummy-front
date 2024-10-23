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
        private String _2G;
        private String _3G;
        private String _4G;
        private String _5G;
        private String _6G;
        private String wifi;




    public Timeline() {

        }

    public Timeline(Long id, Long snippet_idl, Long snippet_idp, String pair, String licensor, String licensee, String signed_date, String expiration_date, String date_type, String _2G, String _3G, String _4G, String _5G, String _6G, String wifi) {
        this.id = id;
        this.snippet_idl = snippet_idl;
        this.snippet_idp = snippet_idp;
        this.pair = pair;
        this.licensor = licensor;
        this.licensee = licensee;
        this.signed_date = signed_date;
        this.expiration_date = expiration_date;
        this.date_type = date_type;
        this._2G = _2G;
        this._3G = _3G;
        this._4G = _4G;
        this._5G = _5G;
        this._6G = _6G;
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

    public void set_5g(String _5G) {
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
}