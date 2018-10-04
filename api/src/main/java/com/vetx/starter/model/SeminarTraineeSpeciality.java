package com.vetx.starter.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.NaturalId;

import javax.persistence.*;
import javax.validation.constraints.PositiveOrZero;

@Entity
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class SeminarTraineeSpeciality {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NaturalId
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long key;

  @PositiveOrZero
  private  Double grade = 0.0;

  private boolean passed = false;

  @JsonBackReference
  @ManyToOne
  @JoinColumn(name="speciality_id")
  private Speciality speciality;

  @JsonBackReference
  @ManyToOne
  @JoinColumn(name="seminarTrainee_id")
  private SeminarTrainee seminarTrainee;
}