package com.platform.dummy;
import jakarta.persistence.*;


@Entity
@Table(name = "info_multiple_licensees")
public class MultipleLicensees {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)


    private Long id;
    private String statment_id;
    private String showedIn;
    private String licensor;
    private Integer multiplier;
    private String qualifiers;
    private String knownLicensee;
    private String typeOfInformation;
    private Integer year;
    private String quarter;
    private String statement;
    private Double valueInKUSD;
    private Double percentage;
    private String valueType;
    private String directoryPath;

    public MultipleLicensees(){

    }

    public MultipleLicensees(Long id, String statment_id, String showedIn, String licensor, Integer multiplier, String qualifiers, String knownLicensee, String typeOfInformation, Integer year, String quarter, String statement, Double valueInKUSD, Double percentage, String valueType, String directoryPath) {
        this.id = id;
        this.statment_id =statment_id;
        this.showedIn = showedIn;
        this.licensor = licensor;
        this.multiplier = multiplier;
        this.qualifiers = qualifiers;
        this.knownLicensee = knownLicensee;
        this.typeOfInformation = typeOfInformation;
        this.year = year;
        this.quarter = quarter;
        this.statement = statement;
        this.valueInKUSD = valueInKUSD;
        this.percentage = percentage;
        this.valueType = valueType;
        this.directoryPath = directoryPath;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShowedIn() {
        return showedIn;
    }

    public void setShowedIn(String showedIn) {
        this.showedIn = showedIn;
    }

    public String getLicensor() {
        return licensor;
    }

    public void setLicensor(String licensor) {
        this.licensor = licensor;
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

    public String getKnownLicensee() {
        return knownLicensee;
    }

    public void setKnownLicensee(String knownLicensee) {
        this.knownLicensee = knownLicensee;
    }

    public String getTypeOfInformation() {
        return typeOfInformation;
    }

    public void setTypeOfInformation(String typeOfInformation) {
        this.typeOfInformation = typeOfInformation;
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

    public String getStatement() {
        return statement;
    }

    public void setStatement(String statement) {
        this.statement = statement;
    }

    public Double getValueInKUSD() {
        return valueInKUSD;
    }

    public void setValueInKUSD(Double valueInKUSD) {
        this.valueInKUSD = valueInKUSD;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public String getValueType() {
        return valueType;
    }

    public void setValueType(String valueType) {
        this.valueType = valueType;
    }

    public String getDirectoryPath() {
        return directoryPath;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }


}
