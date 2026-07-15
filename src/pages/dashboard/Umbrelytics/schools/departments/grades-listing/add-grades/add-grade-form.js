import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { Form, FormikProvider, useFormik, FieldArray } from 'formik';
// material
import { LoadingButton } from '@material-ui/lab';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import {
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  FormHelperText,
  FormControlLabel,
  Paper,
  Box,
  InputAdornment,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@material-ui/core';
import { Icon } from '@iconify/react';
import fakeRequest from 'src/utils/fakeRequest';
import { UploadAvatar } from 'src/components/upload';
import { fData } from 'src/utils/formatNumber';
import copyFill from '@iconify/icons-eva/copy-fill';
import { Delete, Email, Password } from '@material-ui/icons';
import { MIconButton } from 'src/components/@material-extend';
import Scrollbar from 'src/components/Scrollbar';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
// utils

// ----------------------------------------------------------------------

const Teachers = [
  { 
    id: 1, 
    label: 'Michel Cambell',
    subjects: [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'English' }
    ]
  },
  { 
    id: 2, 
    label: 'Andre Thompson',
    subjects: [
      { id: 4, name: 'History' },
      { id: 5, name: 'Geography' },
      { id: 6, name: 'Physics' }
    ]
  },
  { 
    id: 3, 
    label: 'Aisha James',
    subjects: [
      { id: 7, name: 'Chemistry' },
      { id: 8, name: 'Biology' },
      { id: 9, name: 'Computer Science' }
    ]
  }
];


const VALUE = [
  { id: 0, value: 'ID' },
  { id: 1, value: 'Teacher Name' },
  { id: 4, value: 'Assign Subjects' },
  { id: 7, value: 'Actions' },
]

const HodValue = [
  { id: 0, value: 'ID' },
  { id: 1, value: 'HOD Name' },
  { id: 4, value: 'Assign Subjects' },
  { id: 7, value: 'Actions' },
]

// ----------------------------------------------------------------------

export default function AddGradeForm({ classname, setClass,departmentId,gradeId,schoolId ,tempEditId}) {
  const { enqueueSnackbar } = useSnackbar();
  const [teachers,setTeachers] = useState([])
  const [notAssignedTeacher,setNotAssignedTeacher] = useState([])
  const [data,setData] = useState([])
  const user_type = JSON.parse(localStorage.getItem('user_type'));
  const [subjectsList,setSubjectList] = useState([])
  const [optionSubjectList,setOptionSubjectList] = useState([])
  const [hodData, setHodData] = useState([]); 
  const [selectedHod, setSelectedHod] = useState(null); 
  

  useEffect(()=>{
    if(departmentId){
      FetchAllData()
    }
  },[departmentId,tempEditId])
  

  
  // const fetchTeachers = async () => {
  //   try {
  //     // Fetch both subjects and teachers
  //     const subjectResponse = await axios.get(`${REST_API_END_POINT}get-subject/${departmentId}`);
  //     const response = await axios.get(`${REST_API_END_POINT}get-teacher/${departmentId}`);
  
  //     if (response.data.status === 1 && subjectResponse.data.status === 1) {

  
  //       const subjectsList = subjectResponse.data.result; 
  
  //       const transformedTeachers = response.data.result
  //         .filter(teacher => teacher.status === 1  ) 
  //         .map(teacher => {
  //           const subjectIds = teacher.subjects.split(','); 
  //           const assignedSubjectIds = teacher.assignedSubject.split(','); 
  
  //           // Map subject IDs to subject names from the subjects list
  //           const mappedSubjects = subjectIds
  //             .map(subjectId => {
  //               const matchedSubject = subjectsList.find(subject => subject.id === parseInt(subjectId.trim()));
  //               return matchedSubject ? { id: matchedSubject.id, name: matchedSubject.subjectName } : null; // Return null if not found
  //             })
  //             .filter(Boolean); // Remove any null entries if a subject ID doesn't match
  
  //           // Map assigned subject IDs to subject names from the subjects list
  //           const mappedAssignedSubjects = assignedSubjectIds
  //             .map(subjectId => {
  //               const matchedAssignedSubject = subjectsList.find(subject => subject.id === parseInt(subjectId.trim()));
  //               return matchedAssignedSubject ? { id: matchedAssignedSubject.id, name: matchedAssignedSubject.subjectName } : null; // Return null if not found
  //             })
  //             .filter(Boolean); // Remove any null entries
  
  //           // Remove duplicates by converting to a Set and back to an array
  //           const uniqueSubjects = Array.from(new Set(mappedSubjects.map(subj => subj.id)))
  //             .map(id => mappedSubjects.find(subj => subj.id === id));
  
  //           const uniqueAssignedSubjects = Array.from(new Set(mappedAssignedSubjects.map(subj => subj.id)))
  //             .map(id => mappedAssignedSubjects.find(subj => subj.id === id));
  
  //           return {
  //             id: teacher.id,
  //             label: teacher.name,
  //             subjects: uniqueSubjects, // Assign unique subjects
  //             assignedSubject: uniqueAssignedSubjects, // Assign unique assigned subjects
  //             assigned:teacher.assigned
  //           };
  //         });
  
  //         const notAssignedTeachers = transformedTeachers
  //         .filter(teacher => teacher.assigned === 0);


  //       // setNotAssignedTeacher(notAssignedTeachers)
  //       setNotAssignedTeacher(transformedTeachers)
  //       setTeachers(transformedTeachers);
  
  //     } else {
  //       console.log("Not getting data");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching teachers: ", error);
  //   }
  // };
  

  // const FetchAllData = async () => {
  //   try {
  //     const response = await axios.get(`${REST_API_END_POINT}class/get-all-data-class/${departmentId}`)
  //     console.log('responseeeeeresponseeeee',response.data)
  
  //     if (response.data.status === 1 ) {

  
  //       const subjectsList = response.data.SubjectData 
  //     console.log('responseeeeeresponseeeee subjectsList',subjectsList)

  
  //       const transformedTeachers = response.data.teacherData.filter(teacher => teacher.status === 1  ) 
  //         .map(teacher => {
  //           const subjectIds = teacher.subjects.split(','); 
  //           const assignedSubjectIds = teacher.assignedSubject.split(','); 
  
  //           // Map subject IDs to subject names from the subjects list
  //           const mappedSubjects = subjectIds
  //             .map(subjectId => {
  //               const matchedSubject = subjectsList.find(subject => subject.id === parseInt(subjectId.trim()));
  //               return matchedSubject ? { id: matchedSubject.id, name: matchedSubject.subjectName } : null; // Return null if not found
  //             })
  //             .filter(Boolean); // Remove any null entries if a subject ID doesn't match
  
  //           // Map assigned subject IDs to subject names from the subjects list
  //           const mappedAssignedSubjects = assignedSubjectIds
  //             .map(subjectId => {
  //               const matchedAssignedSubject = subjectsList.find(subject => subject.id === parseInt(subjectId.trim()));
  //               return matchedAssignedSubject ? { id: matchedAssignedSubject.id, name: matchedAssignedSubject.subjectName } : null; // Return null if not found
  //             })
  //             .filter(Boolean); // Remove any null entries
  
  //           // Remove duplicates by converting to a Set and back to an array
  //           const uniqueSubjects = Array.from(new Set(mappedSubjects.map(subj => subj.id)))
  //             .map(id => mappedSubjects.find(subj => subj.id === id));
  
  //           const uniqueAssignedSubjects = Array.from(new Set(mappedAssignedSubjects.map(subj => subj.id)))
  //             .map(id => mappedAssignedSubjects.find(subj => subj.id === id));
  
  //           return {
  //             id: teacher.id,
  //             label: teacher.name,
  //             subjects: uniqueSubjects, // Assign unique subjects
  //             assignedSubject: uniqueAssignedSubjects, // Assign unique assigned subjects
  //             assigned:teacher.assigned
  //           };
  //         });
  
  //         const notAssignedTeachers = transformedTeachers
  //         .filter(teacher => teacher.assigned === 0);


  //       // setNotAssignedTeacher(notAssignedTeachers)
  //       console.log('transformedTeacherstransformedTeachers',transformedTeachers)
  //       setNotAssignedTeacher(transformedTeachers)
  //       setTeachers(transformedTeachers);
  
  //     } else {
  //       console.log("Not getting data");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching teachers: ", error);
  //   }
  // };



  const FetchAllData = async () => {
    try {
      const response = await axios.get(`${REST_API_END_POINT}class/get-all-data-class/${departmentId}`);
      console.log('Response:', response.data);
  
      if (response.data.status === 1) {
        const subjectsList = response.data.SubjectData;
        console.log('Subjects List:', subjectsList);
  
        // Transform Teacher Data
        const transformedTeachers = response.data.teacherData
          .filter((teacher) => teacher.status === 1)
          .map((teacher) => transformPerson(teacher, subjectsList));
  
        setTeachers(transformedTeachers);
        setNotAssignedTeacher(
          transformedTeachers.filter((teacher) => teacher.assigned === 0 || 1)
        );
  
        // Transform HOD Data
        const transformedHodData = response.data.HodData.map((hod) =>
          transformPerson(hod, subjectsList)
        );
  
        setHodData(transformedHodData); 
        console.log('transformedHodDatatransformedHodData',transformedHodData)
      } else {
        console.log('No data received.');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };
  
  // Utility function to transform Teacher or HOD
  const transformPerson = (person, subjectsList) => {
    const subjectIds = person.subjects.split(',');
    const assignedSubjectIds = person.assignedSubject.split(',');
  
    const mappedSubjects = subjectIds
      .map((subjectId) => {
        const matchedSubject = subjectsList.find(
          (subject) => subject.id === parseInt(subjectId.trim())
        );
        return matchedSubject ? { id: matchedSubject.id, name: matchedSubject.subjectName } : null;
      })
      .filter(Boolean);
  
    const mappedAssignedSubjects = assignedSubjectIds
      .map((subjectId) => {
        const matchedAssignedSubject = subjectsList.find(
          (subject) => subject.id === parseInt(subjectId.trim())
        );
        return matchedAssignedSubject
          ? { id: matchedAssignedSubject.id, name: matchedAssignedSubject.subjectName }
          : null;
      })
      .filter(Boolean);
  
    return {
      id: person.id,
      label: person.name,
      subjects: Array.from(new Set(mappedSubjects.map((subj) => subj.id))).map((id) =>
        mappedSubjects.find((subj) => subj.id === id)
      ),
      assignedSubject: Array.from(new Set(mappedAssignedSubjects.map((subj) => subj.id))).map((id) =>
        mappedAssignedSubjects.find((subj) => subj.id === id)
      ),
      assigned: person.assigned,
    };
  };
  

  // const fetchClassDataById = async () => {
  //   try {
  //     const response = await axios.get(`${REST_API_END_POINT}get-class-data/${tempEditId}`);
  //     if (response.data.status === 1) {
  //       const teacherIds = response.data.result.teacherId.split(',').map(id => parseInt(id.trim()));
  
  //       // Ensure that teachers are correctly loaded before mapping
  //       if (teachers.length > 0) {
  //         const transformedTeachers = teacherIds.map(id => {
  //           const teacher = teachers.find(teacher => teacher.id === id);
  //           if (teacher) {
  //             return {
  //               id: teacher.id,
  //               label: teacher.label,
  //               subjects: teacher.subjects.map((subject, subjIndex) => ({
  //                 id: subject.id,
  //                 name: subject.name.trim(),
  //               })),
  //               assignedSubject: teacher.assignedSubject.map((subject, subjIndex) => ({
  //                 id: subject.id,
  //                 name: subject.name.trim(),
  //               })),
  //             };
  //           }
  //           return null;
  //         }).filter(teacher => teacher !== null);
  
  //         const transformedData = {
  //           ...response.data.result,
  //           teachers: transformedTeachers
  //         };
  

  //         setData(transformedData);
  //       } else {
  //         console.log("Teachers data is not loaded yet.");
  //       }
  //     } else {
  //       console.log("Not getting data");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching class data:", error);
  //   }
  // };
  

  const fetchClassDataById = async () => {
    try {
      const response = await axios.get(`${REST_API_END_POINT}get-class-data/${tempEditId}`);
      if (response.data.status === 1) {
        const teacherIds = response.data.result.teacherId.split(',').map(id => parseInt(id.trim()));
        const hodIds = response.data.result.hodId?.split(',').map(id => parseInt(id.trim())) || []; // Handle HOD IDs
  
        // Ensure that teachers and HOD data are correctly loaded before mapping
        if (teachers.length > 0 && hodData.length > 0) {
          // Transform Teachers
          const transformedTeachers = teacherIds.map(id => {
            const teacher = teachers.find(teacher => teacher.id === id);
            return teacher ? transformPersonEdit(teacher) : null;
          }).filter(Boolean);
  
          // Transform HODs
          const transformedHods = hodIds.map(id => {
            const hod = hodData.find(hod => hod.id === id);
            return hod ? transformPersonEdit(hod) : null;
          }).filter(Boolean);
  
          const transformedData = {
            ...response.data.result,
            teachers: transformedTeachers,
            hod: transformedHods, // Include transformed HOD data
          };
  
          console.log("Transformed Data:", transformedData); // Debugging
          setData(transformedData);
        } else {
          console.log("Teachers or HOD data is not loaded yet.");
        }
      } else {
        console.log("No class data found.");
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };
  
  // Utility function to transform both Teacher and HOD data
  const transformPersonEdit = (person) => ({
    id: person.id,
    label: person.name || person.label || '',  // Ensure the label is assigned correctly
    subjects: person.subjects?.map((subject) => ({
      id: subject.id,
      name: subject.name.trim(),
    })) || [],
    assignedSubject: person.assignedSubject?.map((subject) => ({
      id: subject.id,
      name: subject.name.trim(),
    })) || [],
  });
  
  
  useEffect(()=>{
    if(tempEditId){
      fetchClassDataById()
    }
  },[departmentId,tempEditId,teachers,hodData])

  const NewBlogSchema = Yup.object().shape({
    className: Yup.string()
    .required('Class Name is required')
    .matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Class Name must contain at least one alphabet and special characters are only allowed after alphabets'),
    // teachers: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       label: Yup.string().required('Teacher is required'),
    //       assignedSubject: Yup.array().min(1, 'At least one subject is required').required('Subjects are required')
    //     })
    //   )
    //   .min(1, 'At least one Teacher is required'),
      
  });

  const formik = useFormik({
    enableReinitialize:true,
    initialValues: {
      className: data?data.name:'',
      teachers: data?.teacherId ? data.teachers: [],
      hod: data?.hod || [], 
      gradeId:gradeId || null,
      schoolId:schoolId || null,
      user_type:user_type || null
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // await fakeRequest(500);
        // resetForm();
        // enqueueSnackbar('Class Added Successfully', { variant: 'success' });
        // setClass(false);
        if(values?.teachers.length < 1 && values.hod.length <1){
          enqueueSnackbar('Atleast one Teacher or HOD is required', { variant: 'warning' });
          return
        }
       const response = await axios.post(`${REST_API_END_POINT}${tempEditId? 'update-class-data/'+tempEditId :'add-class'}`,{values})
        if(response.data.status===1){
          enqueueSnackbar(`Class ${tempEditId? 'Updated' : 'Added'} Successfully`, { variant: 'success' });
          window.location.reload()
        }else{
          enqueueSnackbar(`Class Not ${tempEditId? 'Updated' : 'Added'}`, { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        setSubmitting(false);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleDelete = (entryId) => {
    const updatedEntry = values.teachers.filter(teachers => teachers.id !== entryId);
    setFieldValue('teachers', updatedEntry);
  };

  const handleDeleteHod = (hodId) => {
    const updatedHods = values.hod.filter(h => h.id !== hodId);
    setFieldValue('hod', updatedHods);
  };

  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Paper sx={{ p: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'column', md: 'column' }} spacing={{ xs: 2, sm: 2, md: 2 }}>
                  <Typography variant='h6' sx={{ mb: -0.5 }}>Class Name</Typography>
                  <TextField
                    fullWidth
                    placeholder="Class Name1"
                    {...getFieldProps('className')}
                    error={Boolean(touched.className && errors.className)}
                    helperText={touched.className && errors.className}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'column', md: 'column' }} sx={{ mt: 2.5 }} spacing={{ xs: 2, sm: 2, md: 2 }}>
                  <Typography variant='h6'>Select Teachers</Typography>
                  <Autocomplete
                    fullWidth
                    multiple
                    freeSolo={false}
                    value={values.teachers}
                    onChange={(event, newValue) => {
                      setFieldValue('teachers', newValue);              
                    }}
                    // options={Teachers.filter(teacher => !values.teachers.some(selectedTeacher => selectedTeacher.id === teacher.id))}
                    // options={teachers.map(teacher => ({ id: teacher.id, label: teacher.name }))}
                    // renderTags={(value, getTagProps) =>
                    //   value.map((option, index) => (
                    //     <Chip color='primary' key={option.id} size="small" label={option.label} {...getTagProps({ index })} />
                    //   ))
                    // }
                    // options={teachers}
                    options={notAssignedTeacher.filter(
                      (teacher) => !values.teachers.some((selectedTeacher) => selectedTeacher.id === teacher.id)
                    )}
                    getOptionLabel={(option) => option.label || ''}  
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip color='primary' key={option.id} size="small" label={option.label} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        placeholder="Choose teachers"
                        {...params}
                        error={Boolean(touched.teachers && errors.teachers)}
                        helperText={touched.teachers && typeof errors.teachers === 'string' ? errors.teachers : ''}
                      />
                    )}
                  />
                </Stack>
                {values.teachers.length > 0 ? (
                  <Scrollbar sx={{ mt: 2.5 }}>
                    <TableContainer sx={{ minWidth: 670, whiteSpace: 'nowrap' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {VALUE?.map((val) => (
                              <TableCell sx={{ whiteSpace: 'nowrap' }} key={val.id}>{val.value}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
  {/* {values.teachers.map((subjectsType, index) => (
    <TableRow key={subjectsType?.id}>
      <TableCell>{subjectsType?.id}</TableCell>
      <TableCell>{subjectsType?.label}</TableCell>
      <TableCell>
        <Autocomplete
          fullWidth
          multiple
          size='small'
          // options={subjectsType.subjects || []} 
          options={teachers.find(teacher => teacher.id === subjectsType.id)?.subjects.filter(
            (subject) => !subjectsType.subjects.some(selectedSubject => selectedSubject.id === subject.id)
          ) || []}
          getOptionLabel={(option) => option.name} // Display the subject name
          renderInput={(params) => <TextField {...params} fullWidth placeholder="Choose subjects" />}
          value={subjectsType.subjects || []} // Setting the current subjects as the value
          onChange={(event, newValue) => {
            let updatedEntry = values.teachers.map(e => {
              if (e.id === subjectsType.id) {
                return { ...e, subjects: newValue };
              } else {
                return e;
              }
            });
            setFieldValue('teachers', updatedEntry);
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                size='small'
                color='info'
                key={index}
                label={option.name}
                {...getTagProps({ index })}
              />
            ))
          }
        />
        {touched.teachers && errors.teachers && errors.teachers[index]?.subjects && (
          <FormHelperText error>{errors.teachers[index].subjects}</FormHelperText>
        )}
      </TableCell>
      <TableCell>
        <MIconButton sx={{ color: 'error.main', ml: 0.5 }} onClick={() => handleDelete(subjectsType.id)}>
          <Icon icon={trash2Outline} width={24} height={24} />
        </MIconButton>
      </TableCell>
    </TableRow>
  ))} */}

{values.teachers.map((subjectsType, index) => (
  <TableRow key={subjectsType?.id}>
    <TableCell>{subjectsType?.id}</TableCell>
    <TableCell>{subjectsType?.label}</TableCell>
    <TableCell>
      <Autocomplete
        fullWidth
        multiple
        size="small"
        // Filter out subjects that are already selected in assignedSubject
        options={teachers.find(teacher => teacher.id === subjectsType.id)?.subjects.filter(
          (subject) => !subjectsType.assignedSubject.some(selectedSubject => selectedSubject.id === subject.id)
        ) || []}
        getOptionLabel={(option) => option.name} // Display the subject name
        
        // Ensure assignedSubject is selected as default value
        value={subjectsType.assignedSubject || []} 
         onChange={(event, newValue) => {
          
          let updatedEntry = values.teachers.map(e => {
            if (e.id === subjectsType.id) {
              return { ...e, assignedSubject: newValue }; 
            } else {
              return e;
            }
          });
          setFieldValue('teachers', updatedEntry); 
        }}
        
        // Render the selected subjects as chips
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              size="small"
              color="info"
              key={index}
              label={option.name} // Display the subject name in the chip
              {...getTagProps({ index })}
            />
          ))
        }
        
        // Render the input field
        renderInput={(params) => <TextField {...params} fullWidth placeholder="Choose subjects" />}
      />
      {touched.teachers && errors.teachers && errors.teachers[index]?.assignedSubject && (
        <FormHelperText error>{errors.teachers[index].assignedSubject}</FormHelperText>
      )}
    </TableCell>
    <TableCell>
      <MIconButton sx={{ color: 'error.main', ml: 0.5 }} onClick={() => handleDelete(subjectsType.id)}>
        <Icon icon={trash2Outline} width={24} height={24} />
      </MIconButton>
    </TableCell>
  </TableRow>
))}




</TableBody>

                      </Table>
                    </TableContainer>
                  </Scrollbar>
                ) : null}


                {/* HOD */}

                <Stack direction={{ xs: 'column', sm: 'column', md: 'column' }} sx={{ mt: 2.5 }} spacing={{ xs: 2, sm: 2, md: 2 }}>
  <Typography variant="h6">Select HOD</Typography>
  <Autocomplete
  fullWidth
  multiple // Enable multiple selection
  value={values.hod || []} // Use Formik's value for HOD
  onChange={(event, newValue) => {
    setSelectedHod(newValue); // Update state for selected HODs
    setFieldValue('hod', newValue); // Update Formik field value for HOD
  }}
  options={hodData} // Use HOD data
  getOptionLabel={(option) => option?.label || ''} // Display HOD names
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        key={option.id}
        size="small"
        color="info"
        label={option.label} // Show selected HOD name
        {...getTagProps({ index })}
      />
    ))
  }
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Select HOD(s)"
      error={Boolean(touched.hod && errors.hod)}
      helperText={touched.hod && errors.hod ? errors.hod : ''}
    />
  )}
/>
</Stack>

{values.hod.length > 0 && (
  <Scrollbar sx={{ mt: 2.5 }}>
    <TableContainer sx={{ minWidth: 670, whiteSpace: 'nowrap' }}>
      <Table>
        <TableHead>
          <TableRow>
            {HodValue.map((val) => (
              <TableCell key={val.id} sx={{ whiteSpace: 'nowrap' }}>
                {val.value}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {values.hod.map((hod) => (
            <TableRow key={hod.id}>
              <TableCell>{hod.id}</TableCell>
              <TableCell>{hod.label}</TableCell>
              <TableCell>
                {hod.subjects.map((subject) => (
                  <Chip
                    key={subject.id}
                    size="small"
                    color="info"
                    label={subject.name}
                  />
                ))}
              </TableCell>
            </TableRow>
          ))} */}

{values.hod.map((hod, index) => (
  <TableRow key={hod.id}>
    <TableCell>{hod.id}</TableCell>
    <TableCell>{hod.label}</TableCell>
    <TableCell>
      <Autocomplete
        fullWidth
        multiple
        size="small"
        // Allow selecting and removing subjects for HOD
        options={hodData.find(h => h.id === hod.id)?.subjects.filter(
          (subject) => !hod.assignedSubject.some(selectedSubject => selectedSubject.id === subject.id)
        ) || []}
        getOptionLabel={(option) => option.name} // Display the subject name
        
        // Set current assigned subjects as value
        value={hod.assignedSubject || []} 
        onChange={(event, newValue) => {
          let updatedEntry = values.hod.map(e => {
            if (e.id === hod.id) {
              return { ...e, assignedSubject: newValue }; 
            } else {
              return e;
            }
          });
          setFieldValue('hod', updatedEntry); 
        }}
        
        // Render selected subjects as chips
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              size="small"
              color="info"
              key={index}
              label={option.name}
              {...getTagProps({ index })}
            />
          ))
        }
        
        // Render input field for subjects
        renderInput={(params) => <TextField {...params} fullWidth placeholder="Choose subjects" />}
      />
    </TableCell>
    <TableCell>
      <MIconButton sx={{ color: 'error.main', ml: 0.5 }} onClick={() => handleDeleteHod(hod.id)}>
        <Icon icon={trash2Outline} width={24} height={24} />
      </MIconButton>
    </TableCell>
  </TableRow>
))}

        </TableBody>
      </Table>
    </TableContainer>
  </Scrollbar>
)}



                {/* HOD */}
              </Paper>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <LoadingButton sx={{ color: '#fff', }} color='success' type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Adding...">
                  {tempEditId? 'Update' :'Add'} Class
                </LoadingButton>
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  onClick={() => setClass(false)}
                  sx={{ ml: 1.5 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>
    </>
  );
}