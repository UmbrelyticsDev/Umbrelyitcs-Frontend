import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  DialogActions,
  Grid,
  Paper,
  Stack,
  Typography,
  FormHelperText,
  Tooltip,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@material-ui/lab';
import { UploadSingleFile } from 'src/components/upload';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  RangesDirective,
  RangeDirective,
  ColumnsDirective,
  ColumnDirective,
} from '@syncfusion/ej2-react-spreadsheet';
import { registerLicense } from '@syncfusion/ej2-base';
import Icon from '@iconify/react';
import trash2Fill from '@iconify/icons-eva/trash-2-fill';
import ExcelIcon from 'src/images/xlsx-png.png';
import PDFIcon from 'src/images/pdf-png.png';
import Page from 'src/components/Page';
import HeaderBreadcrumbs from 'src/components/HeaderBreadcrumbs';
import Label from 'src/components/Label';
import AnalyticsImage from './view-marksheet/analytics-image';
import Analytics from 'src/images/content-student-graph.png';
import { CloseRounded } from '@material-ui/icons';
import PDF from 'src/images/Book1.pdf';
import ExcelDoc from 'src/images/Book1.xlsx';
import fakeRequest from 'src/utils/fakeRequest';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { MButton, MLinearProgress } from 'src/components/@material-extend';
import { storage } from 'src/firebase/Constant';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';
import axios from 'axios';
import * as XLSX from 'xlsx';



registerLicense("Ngo9BigBOggjHTQxAR8/V1NCaF1cXGBCf1NpQ3xbf1x0ZFJMZFVbQXFPMyBoS35RckVqWXled3FVRmVeVURy");

const ThumbImgStyle = styled('img')(({ theme }) => ({
  width: 36,
  height: 36,
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadiusSm,
}));

const headerStyle = {
  color: 'green',
};

const headerStyle1 = {
  color: 'white',
  backgroundColor: '#229A16',
};

const validateFile = (file, enqueueSnackbar) => {
  const allowedFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const maxFileSize = 7 * 1024 * 1024; // 7MB

  if (!allowedFileTypes.includes(file.type)) {
    enqueueSnackbar('Invalid file type. Please upload an Excel file.', { variant: 'error' });
    return false;
  }

  if (file.size > maxFileSize) {
    enqueueSnackbar('File size exceeds the 7MB limit.', { variant: 'error' });
    return false;
  }

  return true;
};

const validateFilePDF = (file, enqueueSnackbar) => {
  const allowedFileTypes = ['application/pdf'];
  const maxFileSize = 7 * 1024 * 1024; // 7MB

  if (!allowedFileTypes.includes(file.type)) {
    enqueueSnackbar('Invalid file type. Please upload a PDF file.', { variant: 'error' });
    return false;
  }

  if (file.size > maxFileSize) {
    enqueueSnackbar('File size exceeds the 7MB limit.', { variant: 'error' });
    return false;
  }

  return true;
};
const validateFileCSV = (file, enqueueSnackbar) => {
  const allowedFileTypes = ['text/csv']; // Only CSV
  const maxFileSize = 7 * 1024 * 1024; // 7MB

  if (!allowedFileTypes.includes(file.type)) {
    enqueueSnackbar('Invalid file type. Please upload a CSV file.', { variant: 'error' });
    return false;
  }

  if (file.size > maxFileSize) {
    enqueueSnackbar('File size exceeds the 7MB limit.', { variant: 'error' });
    return false;
  }

  return true;
};

export default function AddMarksheet() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [fileURL, setFileURL] = useState(null); // This will hold the file URL from Firebase
  const [fileData, setFileData] = useState(null); // Holds the file content
  const [loading, setLoading] = useState(false);
  const [isSpreadsheetVisible, setIsSpreadsheetVisible] = useState(false);
  const [isCSVVisible, setIsCSVVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [fileCSV, setFileCSV] = useState(null);
  const [viewMarksheet, setViewMarksheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const location= useLocation()
  const { testId, testName, typeOfTest, departmentId, classId, className, gradeId, schoolId, gradeName, subjectName, subjectId } = location.state || {};
  const [data,setData] = useState([])
  const [uploaded,setUploaded] = useState(false)
  const [uploadedex,setUploadedex] = useState(false)

 
  useEffect(()=>{
    fetchDataById()
  },[testId, refresh])

  const fetchDataById= async()=>{
    try{
      await axios.get(`${REST_API_END_POINT}get-test-data/${testId}`)
      .then(res =>{
        if(res.data.status===1) {
          setData(res.data.result)
          if(res?.data?.result?.marksheetStatus === 1){
            setViewMarksheet(true)
          }
        }else{
          setData([])
        }
      }).catch(err =>console.log(err))
    }catch(error){
      console.log('Error : ',error)
    }
  }


  const NewUserSchema = Yup.object().shape({
    analytics: Yup.mixed().required('Analytics Graph Image is required'),
    img_marksheet: Yup.mixed().required('Marksheet of Image is required'),
    excelDocument: Yup.mixed().required('Excel document is required'),
    csvDocument: Yup.mixed().required('CSV document is required'),
    pdfDocument: Yup.mixed().required('PDF document is required'),
    // excelDocument: Yup.mixed().nullable().test('excel-or-pdf-required', 'Either Excel or PDF document is required', function (value) {
    //   return value || this.parent.pdfDocument;
    // }),
    // pdfDocument: Yup.mixed().nullable().test('excel-or-pdf-required', 'Either Excel or PDF document is required', function (value) {
    //   return value || this.parent.excelDocument;
    // }),
  });

  const formik = useFormik({
    enableReinitialize:true,
    initialValues: {
      analytics:data ? data.graph :  null,
      img_marksheet:data ? data?.marksheet_img :  null,
      excelDocument:data ? data.exel : null,
      csvDocument:data ? data?.csv : null,
      pdfDocument:data ? data.pdf :  null,
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      try {
        const response = await axios.put(`${REST_API_END_POINT}include-marksheet/${testId}`,{values})
        if(response.data.status===1){
          enqueueSnackbar(`Marksheet ${isEditing ? 'Updated' : 'Added'} Successfully`, { variant: 'success' });
          setViewMarksheet(true);
          setIsSpreadsheetVisible(false);
          setIsCSVVisible(false);
          setRefresh(!refresh);
          resetForm()
        }else{
          enqueueSnackbar('Marksheet Not Added', { variant: 'error' });
        }
      } catch (error) {
        setSubmitting(false);
        setErrors(error);
      }
    },
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadImgToFirebase(file,5)
        // setFieldValue('analytics', {
        //   ...file,
        //   preview: URL.createObjectURL(file),
        // });
      }
    },
    [setFieldValue]
  );
  const handleDropsheet = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadImgToFirebase(file,4)
        // setFieldValue('analytics', {
        //   ...file,
        //   preview: URL.createObjectURL(file),
        // });
      }
    },
    [setFieldValue]
  );

  const fileInputRef = useRef();
  const fileCSVInputRef = useRef();
  const fileInputRefPDF = useRef();
  const spreadsheetRef = useRef();
  const CSVRef = useRef();

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      uploadImgToFirebase(selectedFile,1)
      console.log('selectedFile----',selectedFile)
      setFile(selectedFile);
      setIsSpreadsheetVisible(false);
      if (!validateFile(selectedFile, enqueueSnackbar)) {
        fileInputRef.current.value = ''; 
        return;
      }
      const newAttachment = {
        type: 'xlsx',
        name: selectedFile.name,
        size: selectedFile.size,
        url: URL.createObjectURL(selectedFile),
      };
      // setFieldValue('excelDocument', newAttachment);
      fileInputRef.current.value = ''; 
    }
  };
  const handleFileCSVUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      uploadImgToFirebase(selectedFile,3)
      console.log('selectedFile----',selectedFile)
      setFileCSV(selectedFile);
      setIsCSVVisible(false);
      if (!validateFileCSV(selectedFile, enqueueSnackbar)) {
        fileCSVInputRef.current.value = ''; 
        return;
      }
      const newAttachment = {
        type: 'csv',
        name: selectedFile.name,
        size: selectedFile.size,
        url: URL.createObjectURL(selectedFile),
      };
      // setFieldValue('excelDocument', newAttachment);
      fileCSVInputRef.current.value = ''; 
    }
  };

  const handleFileChangePDF = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImgToFirebase(file,2)
      if (!validateFilePDF(file, enqueueSnackbar)) {
        fileInputRefPDF.current.value = ''; 
        return;
      }
      const newAttachment = {
        type: 'pdf',
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      };
      // setFieldValue('pdfDocument', newAttachment);
      fileInputRefPDF.current.value = ''; 
    }
  };

  const uploadImgToFirebase = (file, num) => {
    const storageRef = storage.ref(`images/${file.name}`);
    const uploadTask = storageRef.put(file);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Upload failed:', error);
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);
          
          const fileInfo = {
            name: file.name,
            size: file.size,
            url: downloadURL,
          };
  
          if (num === 1) {
            setFieldValue('excelDocument', fileInfo);
            setUploadedex(true)
          } else if (num === 2) {
            setFieldValue('pdfDocument', fileInfo);
          }else if (num === 3) {
            setFieldValue('csvDocument', fileInfo);
            setUploaded(true)
          } else if(num==4){

            setFieldValue('img_marksheet', downloadURL);
          }
          else {
              setFieldValue('analytics', downloadURL);
          }
        });
      }
    );
  };
  




  useEffect(() => {
    if (file) {
      setIsSpreadsheetVisible(true);
    }
    if (fileCSV) {
      setIsCSVVisible(true);
    }
    
  }, [file,fileCSV]);

  const onDataBound = () => {
    if (spreadsheetRef.current && file) {
      const openOptions = {
        file: file,
      };
      spreadsheetRef.current.open(openOptions);
      setFile(null); 
    }
  };
  const onDataCSVBound = () => {
    if (CSVRef.current && fileCSV) {
      const openOptions = {
        file: fileCSV,
      };
      CSVRef.current.open(openOptions);
      setFileCSV(null); 
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleEditMarksheet = () => {
    setIsEditing(true);
    setUploaded(false);
    setUploadedex(false);
    // setFieldValue('excelDocument', {
    //   type: 'xlsx',
    //   name: 'demo.xlsx',
    //   size: 1024,
    //   url: '#',
    // });
    // setFieldValue('pdfDocument', {
    //   type: 'pdf',
    //   name: 'sample.pdf',
    //   size: 1024,
    //   url: PDF,
    // });
    // setFieldValue('analytics', {
    //   type: 'image/png',
    //   name: 'analytics.png',
    //   preview: Analytics,
    // });
    setIsSpreadsheetVisible(true);
    setIsCSVVisible(true);
    setViewMarksheet(false);
  };

  const marksheetData = [
    { ID: 1, Name: 'John Doe', Mathematics: 85 },
    { ID: 2, Name: 'Jane Smith', Mathematics: 92 },
    { ID: 3, Name: 'Sam Johnson', Mathematics: 78 },
    { ID: 4, Name: 'Alice Brown', Mathematics: 88 },
    { ID: 5, Name: 'Michael Green', Mathematics: 95 },
  ];

  // useEffect(() => {
  //   if (viewMarksheet) {
  //     spreadsheetRef.current.sheets[0].ranges[0].dataSource = marksheetData;
  //     spreadsheetRef.current.refresh();
  //   }
  // }, [viewMarksheet]);

  const handleContextMenuBeforeOpen = (args) => {
    const hiddenItems = ['Add Note', 'Hyperlink'];
    args.items = args.items.filter(item => !hiddenItems.includes(item.text));
  };

  const googleDocsViewer = data?.exel ? `https://docs.google.com/gview?url=${encodeURIComponent(data?.exel)}&embedded=true` : '';
  const googleDocsViewerCSV = data?.csv ? `https://docs.google.com/gview?url=${encodeURIComponent(data?.csv)}&embedded=true` : '';

  return (
    <Page title="Marksheet | Umbrelytics">
      <Container>
        <HeaderBreadcrumbs
          heading={'Marksheet'}
          links={[
            { name: testName ||'Test Details', 
              href: PATH_DASHBOARD.general.gradedetails, 
              state:{ departmentId:departmentId, testName:testName, typeOfTest:typeOfTest, classId:classId, className:className, gradeId:gradeId, schoolId:schoolId, gradeName:gradeName, subjectName:subjectName, subjectId:subjectId } },
            { name: 'Marksheet' },
          ]}
        />
        {loading ? (
          <Grid>
            <Paper sx={{ p: 4, minHeight: 160, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <MLinearProgress color="inherit" sx={{ mb: 2 }} />
                <MLinearProgress color="warning" sx={{ mt: 2, mb: 2 }} />
                <MLinearProgress color="success" sx={{ mt: 2, mb: 2 }} />
                <MLinearProgress color="inherit" sx={{ mt: 2, mb: 2 }} />
              </Box>
            </Paper>
          </Grid>
        ) : (
          <Grid>
            <FormikProvider value={formik}>
              <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      {!viewMarksheet ? (
                        <Stack spacing={3}>
                          <Stack direction={{ xs: 'column', sm: 'column' }}>
                            <Box sx={{ mb: 2.5 }}>
                              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                Upload Marksheet
                              </Typography>
                              <Stack>
                                <Box width={'100%'} display={'flex'} justifyContent={'flex-start'}>
                                  {touched.excelDocument && errors.excelDocument ? (
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        color: '#e94848',
                                        borderColor: '#e94848',
                                        '&:hover': {
                                          backgroundColor: 'rgba(84, 214, 44, 0.08)',
                                          borderColor: '#e94848',
                                        },
                                        width: 'fit-content',
                                      }}
                                      onClick={() => fileInputRef.current.click()}
                                      startIcon={<CloseRounded />}
                                    >
                                      Marksheet Not Uploaded
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        color: '#00a76f',
                                        borderColor: '#00a76f',
                                        '&:hover': {
                                          backgroundColor: 'rgba(84, 214, 44, 0.08)',
                                          borderColor: '#00a76f',
                                        },
                                        width: 'fit-content',
                                      }}
                                      onClick={() => fileInputRef.current.click()}
                                      startIcon={<ThumbImgStyle alt="Excel" src={ExcelIcon} />}
                                    >
                                      Upload Excel Marksheet
                                    </Button>
                                  )}
                                  <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    accept=".xlsx"
                                  />
                                </Box>
                                {touched.excelDocument && errors.excelDocument && (
                                  <Typography
                                    variant="caption"
                                    color={'error.main'}
                                    error
                                    sx={{ mt: 1, ml: 0.5, fontWeight: 'bold' }}
                                  >
                                    * {touched.excelDocument && errors.excelDocument}
                                  </Typography>
                                )}
                                {values.excelDocument ? (
                                  <Tooltip
                                    title={values.excelDocument?.name || values.excelDocument?.size
                                        ? `Uploaded file: ${values.excelDocument?.name || ''} ${values.excelDocument?.size ? `(${(values.excelDocument.size / (1024 * 1024)).toFixed(2)} MB)` : ''}`
                                        : 'Uploaded file'}
                                  >
                                    <Box
                                      sx={{
                                        mt: 2.5,
                                        color: '#54D62C',
                                        backgroundColor: '#E4F8DD',
                                        p: 0.7,
                                        borderRadius: '10px',
                                        maxWidth: 300,
                                        width: 'fit-content',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: '0.75rem',
                                          color: '#54D62C',
                                          fontWeight: '700',
                                          cursor: 'pointer',
                                          maxWidth: 100,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {values.excelDocument?.name || values.excelDocument?.size
                                            ? `Uploaded file: ${values.excelDocument?.name || ''} ${values.excelDocument?.size ? `(${(values.excelDocument.size / (1024 * 1024)).toFixed(2)} MB)` : ''}`
                                            : 'Uploaded file'}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                ) : (
                                  <Label
                                    sx={{
                                      mt: 2.5,
                                      color: '#00a76f',
                                      backgroundColor: '#c3ffe4',
                                      p: 2,
                                      width: 'fit-content',
                                    }}
                                  >
                                    *only xlsx files allowed
                                  </Label>
                                )}
                              </Stack>
                              <Stack sx={{ mt: 2.5, mb: isSpreadsheetVisible && 2.5 }}>
                                {values.excelDocument && (
                                  <Box key={values.excelDocument.name} my={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mt: { xs: 3, sm: 0, md: 0 } }}>
                                      <MButton
                                        color="error"
                                        size="small"
                                        startIcon={<Icon icon={trash2Fill} />}
                                        onClick={() => {
                                          setFieldValue('excelDocument', null);
                                          setIsSpreadsheetVisible(false);
                                        }}
                                        sx={{ mt: -1 }}
                                      >
                                        Delete
                                      </MButton>
                                    </Box>
                                  </Box>
                                )}
                                {isSpreadsheetVisible && values.excelDocument && (
                                  isEditing ? 
                                 
                                 <>
                                   { uploadedex? <SpreadsheetComponent
                                       ref={spreadsheetRef}
                                       allowOpen={true}
                                       openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
                                       allowSave={true}
                                       saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save"
                                       dataBound={onDataBound}
                                       showRibbon={false}
                                       showFormulaBar={false}
                                       allowEditing={false}
                                       allowDelete={false}
                                       showSheetTabs={false}
                                       allowResizing={true}
                                       allowFullScreen={true}
                                       allowFiltering={false}
                                       allowFreezePane={true}
                                       allowHyperlink={false}
                                       enableNotes={false}
                                       contextMenuBeforeOpen={handleContextMenuBeforeOpen}
                                       created={() => {
                                         spreadsheetRef.current.sheets.forEach(sheet => {
                                           sheet.rows = sheet.rows.map(row => {
                                             row.height = 30;
                                             return row;
                                           });
                                         });
                                       }}
                                       height="500px"
                                     >
                                       <SheetsDirective>
                                         <SheetDirective>
                                           <RangesDirective>
                                             <RangeDirective dataSource={ [] }></RangeDirective>
                                           </RangesDirective>
                                           <ColumnsDirective>
                                             <ColumnDirective width={100} />
                                             <ColumnDirective width={200} />
                                             <ColumnDirective width={100} />
                                           </ColumnsDirective>
                                         </SheetDirective>
                                       </SheetsDirective>
                                     </SpreadsheetComponent>:
                                    <>
                                      {googleDocsViewer && (
                                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                        <iframe
                                          src={googleDocsViewer}
                                          width="100%"
                                          height="500px"
                                          title="Excel Viewer"
                                          style={{ marginTop: '16px', display: 'inline-block' }}
                                        ></iframe>
                                      </div>
                                      
                                     )}
                                    </>
                                    }
                                 </>
                                   :
                                     <>
                                     {/* <iframe
                                       allowFullScreen
                                       src={values.excelDocument ? ( values.excelDocument?.url ? values?.excelDocument?.url : values?.excelDocument ) : ''}
                                       type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                       width="100%"
                                       height="500px"
                                     /> */}
                                     { uploadedex? <SpreadsheetComponent
                                       ref={spreadsheetRef}
                                       allowOpen={true}
                                       openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
                                       allowSave={true}
                                       saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save"
                                       dataBound={onDataBound}
                                       showRibbon={false}
                                       showFormulaBar={false}
                                       allowEditing={false}
                                       allowDelete={false}
                                       showSheetTabs={false}
                                       allowResizing={true}
                                       allowFullScreen={true}
                                       allowFiltering={false}
                                       allowFreezePane={true}
                                       allowHyperlink={false}
                                       enableNotes={false}
                                       contextMenuBeforeOpen={handleContextMenuBeforeOpen}
                                       created={() => {
                                         spreadsheetRef.current.sheets.forEach(sheet => {
                                           sheet.rows = sheet.rows.map(row => {
                                             row.height = 30;
                                             return row;
                                           });
                                         });
                                       }}
                                       height="500px"
                                     >
                                       <SheetsDirective>
                                         <SheetDirective>
                                           <RangesDirective>
                                             <RangeDirective dataSource={ [] }></RangeDirective>
                                           </RangesDirective>
                                           <ColumnsDirective>
                                             <ColumnDirective width={100} />
                                             <ColumnDirective width={200} />
                                             <ColumnDirective width={100} />
                                           </ColumnsDirective>
                                         </SheetDirective>
                                       </SheetsDirective>
                                     </SpreadsheetComponent>:
                                    <>
                                      {googleDocsViewer && (
                                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                        <iframe
                                          src={googleDocsViewer}
                                          width="100%"
                                          height="500px"
                                          title="Excel Viewer"
                                          style={{ marginTop: '16px', display: 'inline-block' }}
                                        ></iframe>
                                      </div>
                                      
                                     )}
                                    </>
                                    }
                                     <Box>
                                       <Button
                                           variant="contained"
                                           color="primary"
                                           disabled = {(values.excelDocument || values.excelDocument?.url) ? false : true}
                                           href={values.excelDocument ? ( values.excelDocument?.url ? values?.excelDocument?.url : values?.excelDocument ) : ''}
                                           download
                                           target="_blank"
                                       >
                                           Download Excel
                                       </Button>
                                     </Box>
                                   </>
                                )}
                              </Stack>
                              <Stack sx={{ mt: 0 }}>
                                <Box width={'100%'} flexDirection={'column'} display={'flex'} justifyContent={'flex-start'}>
                                  {touched.pdfDocument && errors.pdfDocument ? (
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        color: '#e94848',
                                        borderColor: '#e94848',
                                        '&:hover': {
                                          backgroundColor: 'rgba(84, 214, 44, 0.08)',
                                          borderColor: '#e94848',
                                        },
                                        width: 'fit-content',
                                      }}
                                      onClick={() => fileInputRefPDF.current.click()}
                                      startIcon={<CloseRounded />}
                                    >
                                      Marksheet Not Uploaded
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        color: '#e94848',
                                        borderColor: '#e94848',
                                        '&:hover': {
                                          backgroundColor: 'rgba(84, 214, 44, 0.08)',
                                          borderColor: '#e94848',
                                        },
                                        width: 'fit-content',
                                      }}
                                      onClick={() => fileInputRefPDF.current.click()}
                                      startIcon={<ThumbImgStyle alt="PDF" src={PDFIcon} />}
                                    >
                                      Upload PDF Marksheet
                                    </Button>
                                  )}
                                  <input
                                    type="file"
                                    ref={fileInputRefPDF}
                                    onChange={handleFileChangePDF}
                                    style={{ display: 'none' }}
                                    accept=".pdf"
                                  />
                                  {touched.pdfDocument && errors.pdfDocument && (
                                    <Typography
                                      variant="caption"
                                      error
                                      sx={{ mt: 1, ml: 0.5, color: '#00a76f', fontWeight: 'bold' }}
                                    >
                                      * {touched.pdfDocument && errors.pdfDocument}
                                    </Typography>
                                  )}
                                  {values.pdfDocument ? (
                                    <Tooltip
                                      title={values.pdfDocument?.name || values.pdfDocument?.size
                                        ? `Uploaded file: ${values.pdfDocument?.name || ''} ${values.pdfDocument?.size ? `(${(values.pdfDocument.size / (1024 * 1024)).toFixed(2)} MB)` : ''}`
                                        : 'Uploaded file'}
                                    >
                                      <Box
                                        sx={{
                                          mt: 2.5,
                                          color: '#54D62C',
                                          backgroundColor: '#E4F8DD',
                                          p: 0.7,
                                          borderRadius: '10px',
                                          maxWidth: 300,
                                          width: 'fit-content',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: '0.75rem',
                                            color: '#54D62C',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            maxWidth: 100,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >{values.pdfDocument?.name || values.pdfDocument?.size
                                          ? `Uploaded file: ${values.pdfDocument?.name || ''} ${values.pdfDocument?.size ? `(${(values.pdfDocument.size / (1024 * 1024)).toFixed(2)} MB)` : ''}`
                                          : 'Uploaded file'}</Typography>
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Label
                                      sx={{
                                        mt: 2.5,
                                        color: '#FF4842',
                                        backgroundColor: '#FFE2E1',
                                        p: 2,
                                        width: 'fit-content',
                                      }}
                                    >
                                      *only pdf files allowed
                                    </Label>
                                  )}
                                </Box>
                                {values.pdfDocument && (
                                  <Box key={values?.pdfDocument?.name} my={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mt: { xs: 3, sm: 0, md: 0 } }}>
                                      <MButton
                                        color="error"
                                        size="small"
                                        startIcon={<Icon icon={trash2Fill} />}
                                        onClick={() => setFieldValue('pdfDocument', null)}
                                        sx={{ mt: -1 }}
                                      >
                                        Delete
                                      </MButton>
                                    </Box>
                                    <iframe
                                      allowFullScreen
                                      src={values.pdfDocument ? ( values.pdfDocument?.url ? values?.pdfDocument?.url : values?.pdfDocument ) : ''}
                                      type="application/pdf"
                                      width="100%"
                                      height="500px"
                                    />
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                              <Stack>
                                <Box width={'100%'} display={'flex'} justifyContent={'flex-start'}>
                                  {touched.csvDocument && errors.csvDocument ? (
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        color: '#e94848',
                                        borderColor: '#e94848',
                                        '&:hover': {
                                          backgroundColor: 'rgba(84, 214, 44, 0.08)',
                                          borderColor: '#e94848',
                                        },
                                        width: 'fit-content',
                                      }}
                                      onClick={() => fileCSVInputRef.current.click()}
                                      startIcon={<CloseRounded />}
                                    >
                                      Marksheet Not Uploaded
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        color: '#35a80b',
                                        borderColor: '#00a76f',
                                        '&:hover': {
                                          backgroundColor: 'rgba(84, 214, 44, 0.08)',
                                          borderColor: '#00a76f',
                                        },
                                        width: 'fit-content',
                                      }}
                                      onClick={() => fileCSVInputRef.current.click()}
                                      startIcon={<div className='bi--filetype-csv'/>}
                                    >
                                      Upload CSV Marksheet
                                    </Button>
                                  )}
                                  <input
                                    type="file"
                                    ref={fileCSVInputRef}
                                    onChange={handleFileCSVUpload}
                                    style={{ display: 'none' }}
                                    accept=".csv"
                                  />
                                </Box>
                                {touched.csvDocument && errors.csvDocument && (
                                  <Typography
                                    variant="caption"
                                    color={'error.main'}
                                    error
                                    sx={{ mt: 1, ml: 0.5, fontWeight: 'bold' }}
                                  >
                                    * {touched.csvDocument && errors.csvDocument}
                                  </Typography>
                                )}
                                {values.csvDocument ? (
                                  <Tooltip
                                    title={values.csvDocument?.name || values.csvDocument?.size
                                        ? `Uploaded file: ${values.csvDocument?.name || ''} ${values.csvDocument?.size ? `(${(values.csvDocument.size / (1024 * 1024)).toFixed(2)} MB)` : ''}`
                                        : 'Uploaded file'}
                                  >
                                    <Box
                                      sx={{
                                        mt: 2.5,
                                        color: '#54D62C',
                                        backgroundColor: '#E4F8DD',
                                        p: 0.7,
                                        borderRadius: '10px',
                                        maxWidth: 300,
                                        width: 'fit-content',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: '0.75rem',
                                          color: '#54D62C',
                                          fontWeight: '700',
                                          cursor: 'pointer',
                                          maxWidth: 100,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {values.csvDocument?.name || values.csvDocument?.size
                                            ? `Uploaded file: ${values.csvDocument?.name || ''} ${values.csvDocument?.size ? `(${(values.csvDocument.size / (1024 * 1024)).toFixed(2)} MB)` : ''}`
                                            : 'Uploaded file'}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                ) : (
                                  <Label
                                    sx={{
                                      mt: 2.5,
                                      color: '#00a76f',
                                      backgroundColor: '#c3ffe4',
                                      p: 2,
                                      width: 'fit-content',
                                    }}
                                  >
                                    *only csv files allowed
                                  </Label>
                                )}
                              </Stack>
                              <Stack sx={{ mt: 2.5, mb: isCSVVisible && 2.5 }}>
                                {values.csvDocument && (
                                  <Box key={values.csvDocument.name} my={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, mt: { xs: 3, sm: 0, md: 0 } }}>
                                      <MButton
                                        color="error"
                                        size="small"
                                        startIcon={<Icon icon={trash2Fill} />}
                                        onClick={() => {
                                          setFieldValue('csvDocument', null);
                                          setIsCSVVisible(false);
                                        }}
                                        sx={{ mt: -1 }}
                                      >
                                        Delete
                                      </MButton>
                                    </Box>
                                  </Box>
                                )}
                                {isCSVVisible && values.csvDocument && (
                                  isEditing ? 
                                  <>
                                    
                                    {uploaded?
                                    <SpreadsheetComponent
                                       ref={CSVRef}
                                       allowOpen={true}
                                       openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
                                       allowSave={true}
                                       saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save"
                                       dataBound={onDataCSVBound}
                                       showRibbon={false}
                                       showFormulaBar={false}
                                       allowEditing={false}
                                       allowDelete={false}
                                       showSheetTabs={false}
                                       allowResizing={true}
                                       allowFullScreen={true}
                                       allowFiltering={false}
                                       allowFreezePane={true}
                                       allowHyperlink={false}
                                       enableNotes={false}
                                       contextMenuBeforeOpen={handleContextMenuBeforeOpen}
                                       created={() => {
                                        CSVRef.current.sheets.forEach(sheet => {
                                           sheet.rows = sheet.rows.map(row => {
                                             row.height = 30;
                                             return row;
                                           });
                                         });
                                       }}
                                       height="500px"
                                     >
                                       <SheetsDirective>
                                         <SheetDirective>
                                           <RangesDirective>
                                             <RangeDirective dataSource={!isEditing ? [] : marksheetData}></RangeDirective>
                                           </RangesDirective>
                                           <ColumnsDirective>
                                             <ColumnDirective width={100} />
                                             <ColumnDirective width={200} />
                                             <ColumnDirective width={100} />
                                           </ColumnsDirective>
                                         </SheetDirective>
                                       </SheetsDirective>
                                     </SpreadsheetComponent>:
                                     <>
                                      {googleDocsViewerCSV && (
                                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                        <iframe
                                          src={googleDocsViewerCSV}
                                          width="100%"
                                          height="500px"
                                          title="CSV Viewer"
                                          style={{ marginTop: '16px', display: 'inline-block' }}
                                        ></iframe>
                                      </div>
                                      
                                     )}
                                    </>
                                    }
  
                                    
                                  </>
                                   :<>
                                    {uploaded?
                                    <SpreadsheetComponent
                                       ref={CSVRef}
                                       allowOpen={true}
                                       openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
                                       allowSave={true}
                                       saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save"
                                       dataBound={onDataCSVBound}
                                       showRibbon={false}
                                       showFormulaBar={false}
                                       allowEditing={false}
                                       allowDelete={false}
                                       showSheetTabs={false}
                                       allowResizing={true}
                                       allowFullScreen={true}
                                       allowFiltering={false}
                                       allowFreezePane={true}
                                       allowHyperlink={false}
                                       enableNotes={false}
                                       contextMenuBeforeOpen={handleContextMenuBeforeOpen}
                                       created={() => {
                                        CSVRef.current.sheets.forEach(sheet => {
                                           sheet.rows = sheet.rows.map(row => {
                                             row.height = 30;
                                             return row;
                                           });
                                         });
                                       }}
                                       height="500px"
                                     >
                                       <SheetsDirective>
                                         <SheetDirective>
                                           <RangesDirective>
                                             <RangeDirective dataSource={!isEditing ? [] : marksheetData}></RangeDirective>
                                           </RangesDirective>
                                           <ColumnsDirective>
                                             <ColumnDirective width={100} />
                                             <ColumnDirective width={200} />
                                             <ColumnDirective width={100} />
                                           </ColumnsDirective>
                                         </SheetDirective>
                                       </SheetsDirective>
                                     </SpreadsheetComponent>:
                                     <>
                                      {googleDocsViewerCSV && (
                                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                        <iframe
                                          src={googleDocsViewerCSV}
                                          width="100%"
                                          height="500px"
                                          title="CSV Viewer"
                                          style={{ marginTop: '16px', display: 'inline-block' }}
                                        ></iframe>
                                      </div>
                                      
                                     )}
                                    </>
                                    }
                                   <Box sx={{mt:2}}>
                                     <Button
                                         variant="contained"
                                         color="primary"
                                         disabled = {(values.csvDocument || values.csvDocument?.url) ? false : true}
                                         href={values.csvDocument ? ( values.csvDocument?.url ? values?.csvDocument?.url : values?.csvDocument ) : ''}
                                         download
                                         target="_blank"
                                     >
                                         Download CSV
                                     </Button>
                                   </Box>
                                 </> 
                                )}
                              </Stack>
                              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                              Upload Marksheet Image
                            </Typography>
                            <UploadSingleFile
                              maxSize={3145728}
                              accept="image/*"
                              file={values.img_marksheet}
                              onDrop={handleDropsheet}
                              error={Boolean(touched.img_marksheet && errors.img_marksheet)}
                              onDelete={() => setFieldValue('img_marksheet', null)}
                            />
                            {touched.img_marksheet && errors.img_marksheet && (
                              <FormHelperText error sx={{ px: 2 }}>
                                {touched.img_marksheet && errors.img_marksheet}
                              </FormHelperText>
                            )}
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                              Analytics Graph Image
                            </Typography>
                            <UploadSingleFile
                              maxSize={3145728}
                              accept="image/*"
                              file={values.analytics}
                              onDrop={handleDrop}
                              error={Boolean(touched.analytics && errors.analytics)}
                              onDelete={() => setFieldValue('analytics', null)}
                            />
                            {touched.analytics && errors.analytics && (
                              <FormHelperText error sx={{ px: 2 }}>
                                {touched.analytics && errors.analytics}
                              </FormHelperText>
                            )}
                          </Stack>

                          <DialogActions>
                            <Box sx={{ flexGrow: 1 }} />
                            <LoadingButton
                              type="submit"
                              color="success"
                              sx={{ color: '#fff' }}
                              variant="contained"
                              loading={isSubmitting}
                              loadingIndicator="Submitting..."
                            >
                              {isEditing ? 'Save & View Marksheet' : 'Add & View Marksheet'}
                            </LoadingButton>
                            <Button type="button" variant="outlined" color="error" onClick={handleGoBack}>
                              Cancel
                            </Button>
                          </DialogActions>
                        </Stack>
                      ) : (
                        <>
                          <Typography variant="h4" sx={{ mb: 3 }}>
                            {className} {typeOfTest} {subjectName} Exam Results
                          </Typography>
                          <Typography variant="subtitle1" sx={{ mb: 3 }}>
                            Excel Marksheet:
                          </Typography>
                          <Box my={1}>
                            <Button
                              variant="contained"
                              color="primary"
                              disabled = {data?.exel ? false : true}
                              href={data?.exel || ''}
                              download
                              target="_blank"
                            >
                                Download Excel
                            </Button>                          

{data?.exel&&<div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                           <iframe
                                             src={googleDocsViewer}
                                             width="100%"
                                             height="500px"
                                             title="Excel Viewer"
                                             style={{ marginTop: '16px', display: 'inline-block' }}
                                           ></iframe>
                                         </div>}
                          </Box>
                          <Typography variant="subtitle1" sx={{ mb: 3,mt:3 }}>
                            PDF Marksheet:
                          </Typography>
                          <Box my={1}>
                            <iframe
                              allowFullScreen
                              src={data?.pdf ? data?.pdf : ''}
                              type="application/pdf"
                              width="100%"
                              height="600px"
                            />
                          </Box>
                          <Typography variant="subtitle1" sx={{ mb: 3 }}>
                            Excel Marksheet:
                          </Typography>
                          <Box my={1}>
                            <Button
                              variant="contained"
                              color="primary"
                              disabled = {data?.csv ? false : true}
                              href={data?.csv || ''}
                              download
                              target="_blank"
                            >
                                Download CSV
                            </Button>                          

                            {data?.csv&&<div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                           <iframe
                                             src={googleDocsViewerCSV}
                                             width="100%"
                                             height="500px"
                                             title="Excel Viewer"
                                             style={{ marginTop: '16px', display: 'inline-block' }}
                                           ></iframe>
                                         </div>}
                          </Box>
                          <AnalyticsImage values={data?.marksheet_img}  />
                                            <AnalyticsImage values={data?.graph}  data={true}/>
                          <DialogActions sx={{ mt: 3 }}>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button color="success" sx={{ color: '#fff' }} variant="contained" onClick={handleGoBack}>
                              {'Save Marksheet'}
                            </Button>
                            <Button color="info" sx={{ color: '#fff' }} variant="contained" onClick={handleEditMarksheet}>
                              {'Edit Marksheet'}
                            </Button>
                            <Button type="button" variant="outlined" color="error" onClick={() => setViewMarksheet(false)}>
                              Cancel
                            </Button>
                          </DialogActions>
                        </>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Form>
            </FormikProvider>
          </Grid>
        )}
      </Container>
    </Page>
  );
};