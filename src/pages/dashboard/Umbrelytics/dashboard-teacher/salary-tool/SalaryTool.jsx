import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from '@material-ui/core'
import axios from 'axios'
import Page from '../../../../../components/Page'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// ----------------------------------------------------------------------
// Teachers' Salary Tool (website version of the old Apps Script calculator).
// A single page that walks the user through: Landing -> Qualification ->
// Salary -> Employment -> Summaries. All maths runs on the Umbrelytics
// backend (/webservice/salary/*); this component only collects input and
// renders the results.
// ----------------------------------------------------------------------

const QUALIFICATIONS = ['None', 'Masters Degree', 'Doctoral Degree']
const POSR_OPTIONS = ['NONE', 'POSR I', 'POSR II', 'POSR III']
const STEPS = ['Start', 'Qualification', 'Salary', 'Employment', 'Summary']

// Format a number as Jamaican currency.
const fmt = (n) =>
  'J$' +
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// A labelled money row used throughout the summaries.
const Row = ({ label, value, negative, strong }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      py: 0.75,
      ...(strong && { fontWeight: 'bold' }),
    }}
  >
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: strong ? 'bold' : 500 }}>
      {negative && value ? '-' : ''}
      {fmt(value)}
    </Typography>
  </Box>
)

export default function SalaryTool() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reference data
  const [classifications, setClassifications] = useState([])

  // Form input
  const [classification, setClassification] = useState('')
  const [qualification, setQualification] = useState('None')
  const [posr, setPosr] = useState('NONE')
  const [grossMonthly, setGrossMonthly] = useState('')
  const [payJTATax, setPayJTATax] = useState(false)
  const [pensionPercentage, setPensionPercentage] = useState('')
  const [employmentDate, setEmploymentDate] = useState('')
  const [employedBefore, setEmployedBefore] = useState(false)

  // Results
  const [calc, setCalc] = useState(null) // /salary/calculate result
  const [revised, setRevised] = useState(null) // /salary/revised result

  // Load the classification dropdown once.
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `${REST_API_END_POINT}salary/classifications`,
        )
        if (res.data.status === 1) setClassifications(res.data.result || [])
      } catch (e) {
        console.log('Failed to load classifications', e)
      }
    }
    load()
  }, [])

  const resetAll = () => {
    setStep(0)
    setClassification('')
    setQualification('None')
    setPosr('NONE')
    setGrossMonthly('')
    setPayJTATax(false)
    setPensionPercentage('')
    setEmploymentDate('')
    setEmployedBefore(false)
    setCalc(null)
    setRevised(null)
    setError('')
  }

  // Step 3 -> call /salary/calculate, then advance to Employment.
  const handleCalculate = async () => {
    setError('')
    if (!classification) return setError('Please choose a classification.')
    if (!grossMonthly || Number(grossMonthly) <= 0)
      return setError('Please enter a valid gross monthly salary.')

    try {
      setLoading(true)
      const res = await axios.post(`${REST_API_END_POINT}salary/calculate`, {
        classification,
        qualification,
        posr,
        grossMonthly: Number(grossMonthly),
        payJTATax,
        pensionPercentage: Number(pensionPercentage) || 0,
      })
      if (res.data.status === 1) {
        setCalc(res.data.result)
        setStep(3)
      } else {
        setError(res.data.message || 'Could not calculate salary.')
      }
    } catch (e) {
      console.log('calculate error', e)
      setError('Server error while calculating salary.')
    } finally {
      setLoading(false)
    }
  }

  // Step 4 -> call /salary/revised, then advance to Summary.
  const handleRevised = async () => {
    setError('')
    if (!calc) return
    try {
      setLoading(true)
      const res = await axios.post(`${REST_API_END_POINT}salary/revised`, {
        band: calc.band,
        point: calc.point,
        qualification,
        posr,
        grossMonthly: Number(grossMonthly),
        payJTATax,
        pensionPercentage: Number(pensionPercentage) || 0,
        employmentDate,
        employedBefore,
        breakService: false,
      })
      if (res.data.status === 1) {
        setRevised(res.data.result)
        setStep(4)
      } else {
        setError(res.data.message || 'Could not compute revised salary.')
      }
    } catch (e) {
      console.log('revised error', e)
      setError('Server error while computing revised salary.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page title="Salary Tool | Umbrelytics">
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 1 }}>
          Salary Tool
        </Typography>

        {step > 0 && (
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* ---------------- Landing ---------------- */}
        {step === 0 && (
          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Work out your band, point and pay
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              This tool determines your salary band and point from your
              classification and gross monthly salary, adds any advanced degree
              or Post of Special Responsibility allowances, and estimates your
              statutory deductions. It then projects your revised salary based
              on completed financial years of service.
            </Typography>
            <Button variant="contained" size="large" onClick={() => setStep(1)}>
              Start
            </Button>
          </Card>
        )}

        {/* ---------------- Qualification ---------------- */}
        {step === 1 && (
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Classification and qualification
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Classification"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                >
                  {classifications.map((c) => (
                    <MenuItem
                      key={c.classification_name}
                      value={c.classification_name}
                    >
                      {c.classification_name} (Band {c.band})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Qualification"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                >
                  {QUALIFICATIONS.map((q) => (
                    <MenuItem key={q} value={q}>
                      {q}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Post of Special Responsibility"
                  value={posr}
                  onChange={(e) => setPosr(e.target.value)}
                >
                  {POSR_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button
                variant="contained"
                disabled={!classification}
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </Stack>
          </Card>
        )}

        {/* ---------------- Salary input ---------------- */}
        {step === 2 && (
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Gross monthly salary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Gross monthly salary (JMD)"
                  value={grossMonthly}
                  onChange={(e) => setGrossMonthly(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Pension contribution (%)"
                  value={pensionPercentage}
                  onChange={(e) => setPensionPercentage(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={payJTATax}
                      onChange={(e) => setPayJTATax(e.target.checked)}
                    />
                  }
                  label="I pay JTA dues (1%)"
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button
                variant="contained"
                onClick={handleCalculate}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} /> : 'Calculate'}
              </Button>
            </Stack>
          </Card>
        )}

        {/* ---------------- First summary + employment ---------------- */}
        {step === 3 && calc && (
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Your salary summary
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              Band {calc.band}, Point {calc.point} - {calc.classification}
            </Typography>

            <Row label="Gross monthly salary" value={calc.grossMonthly} />
            <Row
              label="Advanced degree allowance"
              value={calc.advancedDegreeAllowanceMonthly}
            />
            <Row label="POSR allowance" value={calc.posrAllowanceMonthly} />
            <Divider sx={{ my: 1 }} />
            <Row
              label="Final pay (monthly)"
              value={calc.finalPayMonthly}
              strong
            />

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
              Deductions (monthly)
            </Typography>
            <Row
              label="National Insurance (NIS)"
              value={calc.firstSummaryTax.nationalInsurance}
              negative
            />
            <Row
              label="National Housing Trust (NHT)"
              value={calc.firstSummaryTax.nationalHousingTrust}
              negative
            />
            <Row
              label="Education Tax"
              value={calc.firstSummaryTax.educationTax}
              negative
            />
            <Row
              label="Income Tax (PAYE)"
              value={calc.firstSummaryTax.incomeTax}
              negative
            />
            <Row
              label="JTA dues"
              value={calc.firstSummaryTax.jtaTax}
              negative
            />
            <Row
              label="Pension"
              value={calc.firstSummaryTax.pension}
              negative
            />
            <Divider sx={{ my: 1 }} />
            <Row
              label="Total deductions"
              value={calc.firstSummaryTax.totalTaxes}
              negative
              strong
            />
            <Row
              label="Net pay (monthly)"
              value={calc.firstSummaryTax.netPay}
              strong
            />

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Employment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Employment start date"
                  InputLabelProps={{ shrink: true }}
                  value={employmentDate}
                  onChange={(e) => setEmploymentDate(e.target.value)}
                  disabled={employedBefore}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={employedBefore}
                      onChange={(e) => setEmployedBefore(e.target.checked)}
                    />
                  }
                  label="Employed before April 2022"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setStep(2)}>Back</Button>
              <Button
                variant="contained"
                onClick={handleRevised}
                disabled={loading || (!employmentDate && !employedBefore)}
              >
                {loading ? (
                  <CircularProgress size={22} />
                ) : (
                  'Calculate revised salary'
                )}
              </Button>
            </Stack>
          </Card>
        )}

        {/* ---------------- Second summary ---------------- */}
        {step === 4 && revised && (
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Revised salary summary
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              {revised.completedFinancialYears} completed financial year
              {revised.completedFinancialYears === 1 ? '' : 's'} of service
            </Typography>

            {!revised.hasRevisedSalary ? (
              <Alert severity="info">
                No revised salary applies yet (either no completed financial
                years, or you are already at the top point of your band).
              </Alert>
            ) : (
              <>
                <Row label="Revised point" value={null} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.75,
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Revised point
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Point {revised.revisedPoint}
                  </Typography>
                </Box>
                <Row
                  label="Revised salary (monthly)"
                  value={revised.revisedSalaryMonthly}
                  strong
                />

                {revised.secondSummaryTax && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                      Deductions on revised salary (monthly)
                    </Typography>
                    <Row
                      label="National Insurance (NIS)"
                      value={revised.secondSummaryTax.nationalInsurance}
                      negative
                    />
                    <Row
                      label="National Housing Trust (NHT)"
                      value={revised.secondSummaryTax.nationalHousingTrust}
                      negative
                    />
                    <Row
                      label="Education Tax"
                      value={revised.secondSummaryTax.educationTax}
                      negative
                    />
                    <Row
                      label="Income Tax (PAYE)"
                      value={revised.secondSummaryTax.incomeTax}
                      negative
                    />
                    <Row
                      label="JTA dues"
                      value={revised.secondSummaryTax.jtaTax}
                      negative
                    />
                    <Row
                      label="Pension"
                      value={revised.secondSummaryTax.pension}
                      negative
                    />
                    <Divider sx={{ my: 1 }} />
                    <Row
                      label="Total deductions"
                      value={revised.secondSummaryTax.totalTaxes}
                      negative
                      strong
                    />
                    <Row
                      label="Net pay (monthly)"
                      value={revised.secondSummaryTax.netPay}
                      strong
                    />
                  </>
                )}
              </>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button onClick={() => setStep(3)}>Back</Button>
              <Button variant="outlined" onClick={resetAll}>
                New calculation
              </Button>
            </Stack>
          </Card>
        )}
      </Container>
    </Page>
  )
}
