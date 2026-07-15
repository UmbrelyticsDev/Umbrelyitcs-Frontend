import * as Yup from 'yup';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, DialogActions, Grid, Paper, Stack, Typography, FormHelperText } from '@material-ui/core';
import { useFormik, Form, FormikProvider } from 'formik';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@material-ui/lab';
import { UploadSingleFile } from 'src/components/upload';
import trash2Fill from '@iconify/icons-eva/trash-2-fill';
import Icon from '@iconify/react';
import ExcelIcon from '../../../../../../../../src/images/xlsx-png.png';
import { experimentalStyled as styled } from '@material-ui/core/styles';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'sheetjs-style';
import Page from '../../../../../../../components/Page';
import HeaderBreadcrumbs from '../../../../../../../components/HeaderBreadcrumbs';
import { MButton, MLinearProgress } from 'src/components/@material-extend';
import fakeRequest from 'src/utils/fakeRequest';
import { PATH_DASHBOARD } from '../../../../../../../routes/paths';
import Label from 'src/components/Label';
import Analytics from '../../../../../../../images/content-student-graph.png'
import AnalyticsImage from '../../test/marksheet/view-marksheet/analytics-image';
import PDF from '../../../../../../../images/Book1.pdf';
import { ColumnDirective, ColumnsDirective, RangeDirective, RangesDirective, SheetDirective, SheetsDirective, SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import { registerLicense } from '@syncfusion/ej2-base';
import axios from 'axios';
import { REST_API_END_POINT } from 'src/constants/Defaultvalues';

// ----------------------------------------------------------------------
registerLicense("Ngo9BigBOggjHTQxAR8/V1NCaF1cXGBCf1NpQ3xbf1x0ZFJMZFVbQXFPMyBoS35RckVqWXled3FVRmVeVURy");

const style = {
    p: 4,
    minHeight: 160,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    mt: { xs: 19, sm: 35, md: 18, lg: 18 },
};


const TableContainer = styled('div')(({ theme }) => ({
    width: '100%',
    maxHeight: '300px',
    height: 'fit-content',
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
    whiteSpace: 'nowrap',
    '&::-webkit-scrollbar': {
        width: '6px',
        height: '6px'
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#A5D6A7',
        borderRadius: '3px',
    }
}));

const StyledTable = styled('table')(({ theme }) => ({
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    '& th, & td': {
        border: '1px solid #e6e6e6',
        padding: theme.spacing(0.5),
        textAlign: 'center',
        whiteSpace: 'nowrap'
    },
    '& th': {
        backgroundColor: theme.palette.action.hover,
        whiteSpace: 'nowrap'
    },
    '& th:nth-of-type(n+2):nth-of-type(-n+5)': {
        backgroundColor: 'transparent',
        color: 'green'
    }
}));

const headerStyle = {
    color: 'green',
};

const headerStyle1 = {
    color: 'white',
    backgroundColor: '#229A16'
};

export default function TeacherSubjectMarksheetView() {
    const [loading, setLoading] = useState(false);
    const user_type = JSON.parse(localStorage.getItem('user_type'));
    const location = useLocation();
    const isTestMarksheet = location.pathname === "/dashboard/schools/department/grade-details/marksheet-view";
    const { testId, testName, typeOfTest, departmentId, classId, className, gradeId, schoolId, gradeName, subjectName, subjectId } = location.state || {};
    const spreadsheetRef = useRef();
    const [data,setData] = useState([])

      const marksheetData = [
        { ID: 1, Name: 'John Doe', Mathematics: 85 },
        { ID: 2, Name: 'Jane Smith', Mathematics: 92 },
        { ID: 3, Name: 'Sam Johnson', Mathematics: 78 },
        { ID: 4, Name: 'Alice Brown', Mathematics: 88 },
        { ID: 5, Name: 'Michael Green', Mathematics: 95 },
      ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(()=>{
        fetchDataById()
    },[testId])

    const fetchDataById= async()=>{
        await axios.get(`${REST_API_END_POINT}get-test-data/${testId}`)
        .then(res =>{
            if(res.data.status===1) {
                console.log('res.data.result===',res.data.result)
                setData(res.data.result)
            }else{
                setData([])
            }
        }).catch(err =>console.log(err))
    }

    const handleGoBack = () => {
        window.history.back();
    };

    const getColorFromStyle = (style) => {
        if (style && style.fill && style.fill.fgColor) {
            const { rgb } = style.fill.fgColor;
            if (rgb) {
                return `#${rgb.slice(2)}`;
            }
        }
        return null;
    };

    const getTextStyle = (style) => {
        if (style && style.font) {
            const { bold, italic, underline } = style.font;
            return {
                fontWeight: bold ? 'bold' : 'normal',
                fontStyle: italic ? 'italic' : 'normal',
                textDecoration: underline ? 'underline' : 'none',
            };
        }
        return {};
    };

    const demoData = {
        jsonData: [
            ["Name", "Maths", "Science", "English"],
            ["John Doe", 85, 90, 88],
            ["Jane Smith", 78, 92, 81],
            ["Alice Johnson", 90, 87, 85]
        ],
        worksheet: {
            A1: { v: "Name" },
            B1: { v: "Math" },
            C1: { v: "Science" },
            D1: { v: "English" },
            A2: { v: "John Doe" },
            B2: { v: 85 },
            C2: { v: 90 },
            D2: { v: 88 },
            A3: { v: "Jane Smith" },
            B3: { v: 78 },
            C3: { v: 92 },
            D3: { v: 81 },
            A4: { v: "Alice Johnson" },
            B4: { v: 90 },
            C4: { v: 87 },
            D4: { v: 85 }
        }
    };

    const googleDocsViewer = data?.exel ? `https://docs.google.com/gview?url=${encodeURIComponent(data?.exel)}&embedded=true` : '';
    const googleDocsViewerCSV = data?.exel ? `https://docs.google.com/gview?url=${encodeURIComponent(data?.csv)}&embedded=true` : '';
    return (
        <Page title="Marksheet | Umbrelytics">
            <Container>
                <HeaderBreadcrumbs
                    heading={ className + ' ' + typeOfTest + ' ' + subjectName + ' Exam Results' } //{'1st Class A Mid Term Mathematics Exam Results1'}
                    links={[
                        { name: isTestMarksheet ? testName || 'Test Listing' : user_type === 4 ? className || 'Class Details' : subjectName || 'Subject Listing Details',
                          href: isTestMarksheet ? PATH_DASHBOARD.general.gradedetails : user_type === 4 ? PATH_DASHBOARD.general.gradedetails : PATH_DASHBOARD.general.teacherSubjectLisiting,
                          state: {testId:testId, testName:testName, typeOfTest:typeOfTest, typeOfTest:typeOfTest, typeOfTest:typeOfTest, departmentId:departmentId, classId:classId, className:className, gradeId:gradeId, schoolId:schoolId, gradeName:gradeName, subjectName:subjectName, subjectId:subjectId} },
                        { name: 'Marksheet' }
                    ]}
                />
                {loading ? (
                    <Grid>
                        <Paper sx={style}>
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
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={12}>
                                <Paper variant='outlined' sx={{ p: 3 }}>
                                        <>
                                            <Typography variant="subtitle1" sx={{ mb: 3 }}>
                                                Excel Marksheet :
                                            </Typography>
                                            <Box my={1}>
                                                <Box>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        href={data?.exel}
                                                        download
                                                        target="_blank"
                                                    >
                                                        Download Excel
                                                    </Button>
                                                </Box>
                                               
                                              {/* <SpreadsheetComponent
                                                ref={spreadsheetRef}
                                                allowOpen={true}
                                                openUrl={data?.exel || ''}
                                                // openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
                                                allowSave={true}
                                                saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save"
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
                                                height="500px"
                                                created={() => {
                                                  spreadsheetRef.current.sheets.forEach(sheet => {
                                                    sheet.rows = sheet.rows.map(row => {
                                                      row.height = 30; 
                                                      return row;
                                                    });
                                                  });
                                                }}
                                              >
                                                <SheetsDirective>
                                                  <SheetDirective>
                                                    <RangesDirective>
                                                      <RangeDirective dataSource={data?.exel || ''}></RangeDirective>
                                                    </RangesDirective>
                                                    <ColumnsDirective>
                                                      <ColumnDirective width={100} />
                                                      <ColumnDirective width={200} />
                                                      <ColumnDirective width={100} />
                                                    </ColumnsDirective>
                                                  </SheetDirective>
                                                </SheetsDirective>
                                              </SpreadsheetComponent> */}
                                            </Box>
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
                                            <Typography variant="subtitle1" sx={{ mb: 3,mt:3 }}>
                                                PDF Marksheet :
                                            </Typography>
                                            <Box my={1}>
                                              <iframe
                                                allowFullScreen
                                                src={data?.pdf || ''}
                                                type="application/pdf"
                                                width="100%"
                                                height="500px"
                                              />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ mb: 3 }}>
                                                CSV Marksheet :
                                            </Typography>
                                            <Box my={1}>
                                                <Box>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        href={data?.csv}
                                                        download
                                                        target="_blank"
                                                    >
                                                        Download CSV
                                                    </Button>
                                                </Box>
                                               
                                              {/* <SpreadsheetComponent
                                                ref={spreadsheetRef}
                                                allowOpen={true}
                                                openUrl={data?.exel || ''}
                                                // openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
                                                allowSave={true}
                                                saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save"
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
                                                height="500px"
                                                created={() => {
                                                  spreadsheetRef.current.sheets.forEach(sheet => {
                                                    sheet.rows = sheet.rows.map(row => {
                                                      row.height = 30; 
                                                      return row;
                                                    });
                                                  });
                                                }}
                                              >
                                                <SheetsDirective>
                                                  <SheetDirective>
                                                    <RangesDirective>
                                                      <RangeDirective dataSource={data?.exel || ''}></RangeDirective>
                                                    </RangesDirective>
                                                    <ColumnsDirective>
                                                      <ColumnDirective width={100} />
                                                      <ColumnDirective width={200} />
                                                      <ColumnDirective width={100} />
                                                    </ColumnsDirective>
                                                  </SheetDirective>
                                                </SheetsDirective>
                                              </SpreadsheetComponent> */}
                                            </Box>
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
                                            <AnalyticsImage values={data?.marksheet_img}  />
                                            <AnalyticsImage values={data?.graph}  data={true}/>
                                            <DialogActions sx={{ mt: 3 }}>
                                                <Box sx={{ flexGrow: 1, }} />
                                                <Button type="button" variant="outlined" color="error" onClick={handleGoBack}>
                                                    Close
                                                </Button>
                                            </DialogActions>
                                        </>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Page>
    );
}