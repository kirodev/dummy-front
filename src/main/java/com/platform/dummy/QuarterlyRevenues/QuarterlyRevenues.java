package com.platform.dummy.QuarterlyRevenues;


import javax.persistence.*;

@Entity
@Table(name = "quarterly_revenues")
public class QuarterlyRevenues {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "licensor")
    private String licensor;

    @Column(name = "year")
    private Integer year;

    @Column(name = "quarter")
    private String quarter;

    @Column(name = "revenue")
    private Double revenue;

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLicensor() {
        return licensor;
    }

    public void setLicensor(String licensor) {
        this.licensor = licensor;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getQuarter() {
        return quarter;
    }

    public void setQuarter(String quarter) {
        this.quarter = quarter;
    }

    public Double getRevenue() {
        return revenue;
    }

    public void setRevenue(Double revenue) {
        this.revenue = revenue;
    }

}
