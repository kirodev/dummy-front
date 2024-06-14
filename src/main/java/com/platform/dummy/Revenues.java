package com.platform.dummy;

import javax.persistence.*;


@Entity
@Table(name = "total_revenues")
public class Revenues {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String licensor;
    private String currency;
    private Float year2011;
    private Float year2012;
    private Float year2013;
    private Float year2014;
    private Float year2015;
    private Float year2016;
    private Float year2017;
    private Float year2018;
    private Float year2019;
    private Float year2020;
    private Float year2021;
    private Float year2022;
    private Float year2023;

    public Revenues(Long id, String licensor, String currency, Float year2011, Float year2012, Float year2013, Float year2014, Float year2015, Float year2016, Float year2017, Float year2018, Float year2019, Float year2020, Float year2021, Float year2022, Float year2023) {
        this.id = id;
        this.licensor = licensor;
        this.currency = currency;
        this.year2011 = year2011;
        this.year2012 = year2012;
        this.year2013 = year2013;
        this.year2014 = year2014;
        this.year2015 = year2015;
        this.year2016 = year2016;
        this.year2017 = year2017;
        this.year2018 = year2018;
        this.year2019 = year2019;
        this.year2020 = year2020;
        this.year2021 = year2021;
        this.year2022 = year2022;
        this.year2023 = year2023;
    }

    public Revenues() {

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

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Float getYear2011() {
        return year2011;
    }

    public void setYear2011(Float year2011) {
        this.year2011 = year2011;
    }

    public Float getYear2012() {
        return year2012;
    }

    public void setYear2012(Float year2012) {
        this.year2012 = year2012;
    }

    public Float getYear2013() {
        return year2013;
    }

    public void setYear2013(Float year2013) {
        this.year2013 = year2013;
    }

    public Float getYear2014() {
        return year2014;
    }

    public void setYear2014(Float year2014) {
        this.year2014 = year2014;
    }

    public Float getYear2015() {
        return year2015;
    }

    public void setYear2015(Float year2015) {
        this.year2015 = year2015;
    }

    public Float getYear2016() {
        return year2016;
    }

    public void setYear2016(Float year2016) {
        this.year2016 = year2016;
    }

    public Float getYear2017() {
        return year2017;
    }

    public void setYear2017(Float year2017) {
        this.year2017 = year2017;
    }

    public Float getYear2018() {
        return year2018;
    }

    public void setYear2018(Float year2018) {
        this.year2018 = year2018;
    }

    public Float getYear2019() {
        return year2019;
    }

    public void setYear2019(Float year2019) {
        this.year2019 = year2019;
    }

    public Float getYear2020() {
        return year2020;
    }

    public void setYear2020(Float year2020) {
        this.year2020 = year2020;
    }

    public Float getYear2021() {
        return year2021;
    }

    public void setYear2021(Float year2021) {
        this.year2021 = year2021;
    }

    public Float getYear2022() {
        return year2022;
    }

    public void setYear2022(Float year2022) {
        this.year2022 = year2022;
    }

    public Float getYear2023() {
        return year2023;
    }

    public void setYear2023(Float year2023) {
        this.year2023 = year2023;
    }
}
