package com.platform.dummy.sales;



import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "sales")

public class Sales {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String company;
    private String sources;
    private String link;
    private Integer years;
    private String quarters;
    private Double total;
    private Double sales;
    private Double others;


    // Constructors, getters, and setters

    public Sales() {
    }


    public Sales(Long id, String company, String sources, String link, Integer years, String quarters, Double total,
            Double sales, Double others) {
        this.id = id;
        this.company = company;
        this.sources = sources;
        this.link = link;
        this.years = years;
        this.quarters = quarters;
        this.total = total;
        this.sales = sales;
        this.others = others;
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getCompany() {
        return company;
    }


    public void setCompany(String company) {
        this.company = company;
    }


    public String getSources() {
        return sources;
    }


    public void setSources(String sources) {
        this.sources = sources;
    }


    public String getLink() {
        return link;
    }


    public void setLink(String link) {
        this.link = link;
    }


    public Integer getYears() {
        return years;
    }


    public void setYears(Integer years) {
        this.years = years;
    }


    public String getQuarters() {
        return quarters;
    }


    public void setQuarters(String quarters) {
        this.quarters = quarters;
    }


    public Double getTotal() {
        return total;
    }


    public void setTotal(Double total) {
        this.total = total;
    }


    public Double getSales() {
        return sales;
    }


    public void setSales(Double sales) {
        this.sales = sales;
    }


    public Double getOthers() {
        return others;
    }


    public void setOthers(Double others) {
        this.others = others;
    }

}
