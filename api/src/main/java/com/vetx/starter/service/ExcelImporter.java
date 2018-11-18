package com.vetx.starter.service;

import com.vetx.starter.model.*;
import com.vetx.starter.payload.ApiResponse;
import com.vetx.starter.repository.*;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.NumberToTextConverter;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
@Transactional
public class ExcelImporter {

  private TraineeRepository traineeRepository;
  private SeminarTraineeRepository seminarTraineeRepository;
  private ContractorRepository contractorRepository;
  private SpecialtyRepository specialtyRepository;
  private SeminarSpecialtyRepository seminarSpecialtyRepository;
  private SeminarContractorRepository seminarContractorRepository;

  @Autowired
  public ExcelImporter(TraineeRepository traineeRepository, SeminarTraineeRepository seminarTraineeRepository, ContractorRepository contractorRepository, SpecialtyRepository specialtyRepository, SeminarSpecialtyRepository seminarSpecialtyRepository, SeminarContractorRepository seminarContractorRepository) {
    this.traineeRepository = traineeRepository;
    this.seminarTraineeRepository = seminarTraineeRepository;
    this.contractorRepository = contractorRepository;
    this.specialtyRepository = specialtyRepository;
    this.seminarSpecialtyRepository = seminarSpecialtyRepository;
    this.seminarContractorRepository = seminarContractorRepository;
  }

  public ApiResponse importExcel(Seminar seminar, byte[] uploadedExcelFile, String originalFileName) throws IOException {

    Contractor contractor = null;
    Trainee trainee = null;
    InputStream excelInputStream = new ByteArrayInputStream(uploadedExcelFile);

    //Trainee data initialization
    String traineeDocumentCode = null;
    String traineeName = null;
    String traineeSurname = null;
    String traineeFathersName = null;
    String traineeNationality = null;
    String traineeAma = null;
    DocType docType = DocType.NONE;

    //Contractor data initialization
    String contractorName = null;
    String contractorActivity = null;
    String contractorAfm = "";
    String contractorAddress = null;
    String contractorDOY = null;
    String contractorEmail = null;
    String contractorPhoneNumber = "";
    String contractorRepresentativeName = null;

    Map<Integer, Specialty> specialtyList = new HashMap<>();

    try {
      Workbook workbook = originalFileName.endsWith("xls") ? new HSSFWorkbook(excelInputStream) : new XSSFWorkbook(excelInputStream);
      Sheet datatypeSheet = workbook.getSheetAt(0);
      Iterator<Row> iterator = datatypeSheet.iterator();

      for (Row row : datatypeSheet) {
        traineeAma = null;
        List<SeminarContractorTraineeSpecialty> seminarContractorTraineeSpecialtyList = new ArrayList<>();
        for (Cell cell : row) {
          switch (cell.getRowIndex()) {
            case 0:
              //do nothing, there lands a title which I don't think we need and we care about too.
              break;
            case 1:
              if (cell.getColumnIndex() == 2)     //Contractor's name
              {
                contractorName = cell.getStringCellValue().trim();
              }
              break;
            case 2:
              if (cell.getColumnIndex() == 0)          //Activity
              {
                contractorActivity = cell.getStringCellValue().trim();
                contractorActivity = contractorActivity.split(":")[1].trim();
              } else if (cell.getColumnIndex() == 6)     //ΑΦΜ
              {
                if(cell.getCellType() == CellType.NUMERIC) {
                  contractorAfm = NumberToTextConverter.toText(cell.getNumericCellValue());
                }
                else {
                  contractorAfm = cell.getStringCellValue().trim();
                }
              }
              break;
            case 3:
              if (cell.getColumnIndex() == 2)           //Address
              {
                contractorAddress = cell.getStringCellValue().trim();

              } else if (cell.getColumnIndex() == 6)       //DOY
              {
                contractorDOY = cell.getStringCellValue().trim();
              }
              if (cell.getColumnIndex() >= 11) {
                if (cell.getStringCellValue().trim().length() > 0) {
                  Optional<Specialty> specialtyOptional = specialtyRepository.findByName(cell.getStringCellValue().trim());
                  if (!specialtyOptional.isPresent()) {
                    specialtyRepository.save(Specialty.builder().name(cell.getStringCellValue().trim()).build());
                  }
                  Specialty specialty = specialtyRepository.findByName(cell.getStringCellValue().trim()).get();
                  specialtyList.put(cell.getColumnIndex(), specialty);
                }
              }
              break;
            case 4:
              if (cell.getColumnIndex() == 2)           //Email
              {
                contractorEmail = cell.getStringCellValue().trim();
              } else if (cell.getColumnIndex() == 6)       //Phone Number
              {
                contractorPhoneNumber = cell.getStringCellValue().trim();
              }
              break;
            case 5:
              if (cell.getColumnIndex() == 2)           //Representative
              {
                contractorRepresentativeName = cell.getStringCellValue().trim();
              }
              break;
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
              //do nothing for now
              break;
            default:                                //Trainee section
              switch (cell.getColumnIndex()) {
                case 0:
                  break;
                case 1:
                  traineeSurname = cell.getStringCellValue().trim();
                  break;
                case 2:
                  traineeName = cell.getStringCellValue().trim();
                  break;
                case 3:
                  traineeFathersName = cell.getStringCellValue().trim();
                  break;
                case 4:
                  traineeNationality = cell.getStringCellValue().trim();
                  break;
                case 5:
                  traineeDocumentCode = cell.getStringCellValue().trim();
                  break;
                case 6:
                case 7:
                case 8:
                  CellStyle cellStyle = datatypeSheet.getRow(cell.getRowIndex()).getCell(cell.getColumnIndex()).getCellStyle();
                  if (IndexedColors.AUTOMATIC.index != cellStyle.getFillForegroundColor()) {
                    switch (cell.getColumnIndex()) {
                      case 6:
                        docType = DocType.IDENTITY;
                        break;
                      case 7:
                        docType = DocType.PASSPORT;
                        break;
                      case 8:
                        docType = DocType.DRIVING_LICENSE;
                        break;
                      default:
                        break;
                    }
                  }
                  break;
                case 9:
                  try {
                    traineeAma = Double.toString(cell.getNumericCellValue()).split("\\.")[0];
                  } catch (IllegalStateException e) {
                    traineeAma = cell.getStringCellValue().trim();
                  }
                  break;
                case 10:
                  break;
                default:
                  CellStyle specialtyCellStyle = datatypeSheet.getRow(cell.getRowIndex()).getCell(cell.getColumnIndex()).getCellStyle();
                  if (IndexedColors.AUTOMATIC.getIndex() != specialtyCellStyle.getFillForegroundColor()) {
                    //TODO Import to seminarTraineeSpecialties
                    seminarContractorTraineeSpecialtyList.add(SeminarContractorTraineeSpecialty.builder().specialty(specialtyList.get(cell.getColumnIndex())).build());
                    if(!seminarSpecialtyRepository.existsSeminarSpecialtyBySeminarAndSpecialty(seminar, specialtyList.get(cell.getColumnIndex()))) {
                      SeminarSpecialty seminarSpecialty = SeminarSpecialty.builder().seminar(seminar).specialty(specialtyList.get(cell.getColumnIndex())).build();
                      seminarSpecialtyRepository.save(seminarSpecialty);
                    }
                  }

              }
              break;
          }
        }
        //Build Trainne from excel
        if (traineeAma != null) {
          trainee = Trainee.builder().docType(docType).ama(traineeAma).documentCode(traineeDocumentCode)
              .name(traineeName).surname(traineeSurname).fathersName(traineeFathersName).nationality(traineeNationality).build();
          //Build Contractor from excel
          contractor = Contractor.builder().activity(contractorActivity).address(contractorAddress).afm(contractorAfm).doy(contractorDOY).name(contractorName)
              .email(contractorEmail).representativeName(contractorRepresentativeName).phoneNumber(contractorPhoneNumber).build();
          //Save Contractor and Trainee to database (Update/override if already exists)
          saveContractorAndTrainee(contractor, trainee, seminarContractorTraineeSpecialtyList, seminar);
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    return new ApiResponse(true, "File uploaded succesfully");
  }

  private void saveContractorAndTrainee(Contractor contractor, Trainee trainee, List<SeminarContractorTraineeSpecialty> seminarContractorTraineeSpecialtyList, Seminar seminar) {
    // Save Contractor to repo
    Optional<Contractor> contractorOptional = contractorRepository.findByAfm(contractor.getAfm());
    if (!contractorOptional.isPresent()) {
      contractor = contractorRepository.save(contractor);
    } else {
      contractorOptional.get().setActivity(contractor.getActivity());
      contractorOptional.get().setAddress(contractor.getAddress());
      contractorOptional.get().setDoy(contractor.getDoy());
      contractorOptional.get().setEmail(contractor.getEmail());
      contractorOptional.get().setName(contractor.getName());
      contractorOptional.get().setPhoneNumber(contractor.getPhoneNumber());
      contractorOptional.get().setRepresentativeName(contractor.getRepresentativeName());
      contractor = contractorRepository.save(contractorOptional.get());
    }

    //Save Trainee to repo
    Optional<Trainee> traineeOptional = traineeRepository.findByAma(trainee.getAma());
    if (!traineeOptional.isPresent()) {
      trainee = traineeRepository.save(trainee);
    } else {
      traineeOptional.get().setDocType(trainee.getDocType());
      traineeOptional.get().setDocumentCode(trainee.getDocumentCode());
      traineeOptional.get().setFathersName(trainee.getFathersName());
      traineeOptional.get().setName(trainee.getName());
      traineeOptional.get().setNationality(trainee.getNationality());
      traineeOptional.get().setSurname(trainee.getSurname());
      trainee = traineeRepository.save(traineeOptional.get());
    }

    Optional<SeminarContractor> seminarContractorOptional = seminarContractorRepository.findBySeminarAndContractor(seminar, contractor);
    if(!seminarContractorOptional.isPresent()) {
      seminarContractorRepository.save(SeminarContractor.builder().contractor(contractor).seminar(seminar).build());
    }

    Contractor finalContractor = contractor;
    Trainee finalTrainee = trainee;

    seminarContractorTraineeSpecialtyList.forEach(seminarTrainee -> {
      Optional<SeminarContractorTraineeSpecialty> seminarTraineeOptional = seminarTraineeRepository.findBySeminarAndContractorAndTraineeAndSpecialty(seminar, finalContractor, finalTrainee, seminarTrainee.getSpecialty());
      if (!seminarTraineeOptional.isPresent()) {
        seminarTrainee.setSeminarContractor(finalContractor);
        seminarTrainee.setTrainee(finalTrainee);
        seminarTrainee.setSeminar(seminar);
        seminarTraineeRepository.save(seminarTrainee);
      }
    });
  }
}
