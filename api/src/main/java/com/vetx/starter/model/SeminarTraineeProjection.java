package com.vetx.starter.model;

import org.springframework.data.rest.core.config.Projection;

import java.util.Set;

@Projection(name = "SeminarTraineeProjection", types = {SeminarTrainee.class})
public interface SeminarTraineeProjection {
  Long getKey();
  Trainee getTrainee();
  Contractor getContractor();
  Double getGrade();
  boolean isPassed();
  Specialty getSpecialty();
  Seminar getSeminar();
}
