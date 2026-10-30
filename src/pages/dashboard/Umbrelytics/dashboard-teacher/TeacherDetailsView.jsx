import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Grid,
  Stack,
  Box,
  Avatar,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@material-ui/core'
import { Icon } from '@iconify/react'
import editFill from '@iconify/icons-eva/edit-2-fill'
import emailFill from '@iconify/icons-eva/email-fill'
import phoneFill from '@iconify/icons-eva/phone-fill'
import pinFill from '@iconify/icons-eva/pin-fill'
import bookOpenFill from '@iconify/icons-eva/book-open-fill'
import homeFill from '@iconify/icons-eva/home-fill'
import Page from '../../../../components/Page'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'
import { PATH_DASHBOARD } from 'src/routes/paths'

// Read-only view of the signed-in teacher's own details, now including a
// read-only Salary & Employment card and an on-demand salary calculation.
// The salary inputs are edited on the Update Profile form; here they are only
// displayed, and the calculation is shown when the teacher asks for it.

const user = JSON.parse(localStorage.getItem('user') || '{}')
const user_type = JSON.parse(localStorage.getItem('user_type'))

// Format a number as Jamaican currency.
const fmt = (n) =>
  'J$' +
  Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export default function TeacherDetailsView() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teacher, setTeacher] = useState(null)
  const [subjectNames, setSubjectNames] = useState([])
  const [school, setSchool] = useState(null)

  // Salary profile (read-only) + on-demand calculation.
  const [salaryProfile, setSalaryProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const teacherId = user?.teacherId

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await axios.get(
          `${REST_API_END_POINT}get-teacher-details-for-editing/${teacherId}`,
        )

        if (res.data?.status !== 1 || !res.data?.result) {
          setError('Could not load your details.')
          return
        }

        const data = res.data.result
        setTeacher(data)

        // Resolve subject names.
        // Independent teachers (user_type 5) store subjects as FREE TEXT in the
        // `subjects` field (e.g. "Chemistry, Physics"), so display them as-is.
        // School teachers store subject IDs, resolved against their department.
        if (data.subjects) {
          try {
            if (Number(user_type) === 5) {
              setSubjectNames(
                String(data.subjects)
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            } else {
              const theDepartmentId = data.departmentId || user?.departmentId
              if (theDepartmentId) {
                const subRes = await axios.get(
                  `${REST_API_END_POINT}get-subject/${theDepartmentId}`,
                )
                const subjectsList = (
                  subRes.data?.subjects ||
                  subRes.data?.result ||
                  []
                ).filter((s) => s.status === 1)
                const selectedIds = String(data.subjects)
                  .split(',')
                  .map((id) => parseInt(id, 10))
                  .filter((id) => !Number.isNaN(id))
                const names = selectedIds
                  .map(
                    (id) => subjectsList.find((s) => s.id === id)?.subjectName,
                  )
                  .filter(Boolean)
                setSubjectNames(names)
              }
            }
          } catch (e) {
            console.error('Failed to resolve subject names:', e)
          }
        }

        // School-linked teachers (user_type 4) also show their school card.
        if (user_type === 4 && data.schoolId) {
          try {
            const schoolRes = await axios.get(
              `${REST_API_END_POINT}getSchool-details/${data.schoolId}`,
            )
            if (schoolRes.data?.status === 1) setSchool(schoolRes.data.result)
          } catch (e) {
            console.error('Failed to load school details:', e)
          }
        }

        // Read-only salary profile.
        try {
          const spRes = await axios.get(
            `${REST_API_END_POINT}salary/profile/${teacherId}`,
          )
          if (spRes.data?.status === 1)
            setSalaryProfile(spRes.data.result || null)
        } catch (e) {
          console.error('Failed to load salary profile:', e)
        }
      } catch (e) {
        console.error('Failed to load teacher details:', e)
        setError('Could not load your details.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToEdit = () => navigate('/dashboard/teacher-details/profile')

  const handleShowCalculation = async () => {
    setSummaryError('')
    setSummaryLoading(true)
    setShowSummary(true)
    try {
      const res = await axios.get(
        `${REST_API_END_POINT}salary/summary/${teacherId}`,
      )
      if (res.data?.status === 1) {
        setSummary(res.data.result)
      } else {
        setSummary(null)
        setSummaryError(res.data?.message || 'Could not calculate your salary.')
      }
    } catch (e) {
      console.error('Salary summary failed:', e)
      setSummary(null)
      setSummaryError('Could not calculate your salary.')
    } finally {
      setSummaryLoading(false)
    }
  }

  const hasSalaryData =
    salaryProfile &&
    (salaryProfile.classification || salaryProfile.gross_monthly != null)

  return (
    <Page title="Teacher Details | Umbrelytics">
      <Container maxWidth="lg">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4">Teacher Details</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Your current profile information
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Icon icon={editFill} />}
            onClick={goToEdit}
          >
            Update Profile
          </Button>
        </Stack>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && teacher && (
          <Grid container spacing={3}>
            {/* Identity card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  src={teacher.image || ''}
                  alt={teacher.name}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h5">{teacher.name}</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  {user_type === 4 ? 'School Teacher' : 'Teacher'}
                </Typography>
                {teacher.status === 1 ? (
                  <Chip label="Active" color="success" size="small" />
                ) : (
                  <Chip label="Inactive" size="small" />
                )}
              </Card>
            </Grid>

            {/* Details card */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Contact & Teaching
                  </Typography>

                  <Stack spacing={2.5}>
                    <InfoRow
                      icon={emailFill}
                      label="Email"
                      value={teacher.email}
                    />
                    <InfoRow
                      icon={phoneFill}
                      label="Phone"
                      value={teacher.phoneNumber || '—'}
                    />
                    <InfoRow
                      icon={pinFill}
                      label="Location"
                      value={teacher.location || '—'}
                    />
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{ mb: 1 }}
                      >
                        <Box
                          component={Icon}
                          icon={bookOpenFill}
                          sx={{
                            width: 22,
                            height: 22,
                            color: 'text.secondary',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          Subjects
                        </Typography>
                      </Stack>
                      {subjectNames.length > 0 ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            pl: 4.5,
                          }}
                        >
                          {subjectNames.map((name) => (
                            <Chip key={name} label={name} size="small" />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ pl: 4.5 }}>
                          —
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" sx={{ mb: 1.5 }}>
                    Teaching Philosophy
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: teacher.teaching_philosophy
                        ? 'text.primary'
                        : 'text.secondary',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {teacher.teaching_philosophy ||
                      'No teaching philosophy added yet.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Salary & Employment (read-only) + on-demand calculation */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6">Salary & Employment</Typography>
                    <Button
                      variant="outlined"
                      disabled={!hasSalaryData || summaryLoading}
                      onClick={handleShowCalculation}
                    >
                      {summaryLoading
                        ? 'Calculating...'
                        : 'Show Salary Calculation Information'}
                    </Button>
                  </Stack>

                  {!hasSalaryData ? (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      No salary details yet. Add them from Update Profile.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      <ReadRow
                        label="Classification"
                        value={salaryProfile.classification}
                      />
                      <ReadRow
                        label="Qualification"
                        value={salaryProfile.qualification}
                      />
                      <ReadRow label="POSR" value={salaryProfile.posr} />
                      <ReadRow
                        label="Gross monthly salary"
                        value={
                          salaryProfile.gross_monthly != null
                            ? fmt(salaryProfile.gross_monthly)
                            : '—'
                        }
                      />
                      <ReadRow
                        label="Pension contribution"
                        value={`${salaryProfile.pension_percentage || 0}%`}
                      />
                      <ReadRow
                        label="JTA dues"
                        value={salaryProfile.pay_jta_tax ? 'Yes' : 'No'}
                      />
                      <ReadRow
                        label="Employment start date"
                        value={salaryProfile.employment_date || '—'}
                      />
                    </Grid>
                  )}

                  {showSummary && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      {summaryError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {summaryError}
                        </Alert>
                      )}

                      {summary && !summary.hasCalculation && (
                        <Alert severity="info">
                          Your gross monthly salary does not match a point in
                          band {summary.band}. Expected a monthly figure between{' '}
                          {fmt(summary.minMonthly)} and{' '}
                          {fmt(summary.maxMonthly)}.
                        </Alert>
                      )}

                      {summary && summary.hasCalculation && (
                        <Grid container spacing={3}>
                          {/* Current */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Current — Band {summary.band}, Point{' '}
                              {summary.point}
                            </Typography>
                            <MoneyRow
                              label="Gross monthly"
                              value={summary.grossMonthly}
                            />
                            <MoneyRow
                              label="Advanced degree allowance"
                              value={summary.advancedDegreeAllowanceMonthly}
                            />
                            <MoneyRow
                              label="POSR allowance"
                              value={summary.posrAllowanceMonthly}
                            />
                            <Divider sx={{ my: 1 }} />
                            <MoneyRow
                              label="Final pay (monthly)"
                              value={summary.finalPayMonthly}
                              strong
                            />

                            <Typography
                              variant="subtitle2"
                              sx={{ mt: 2, mb: 1 }}
                            >
                              Deductions (monthly)
                            </Typography>
                            <MoneyRow
                              label="NIS"
                              value={summary.firstSummaryTax.nationalInsurance}
                              negative
                            />
                            <MoneyRow
                              label="NHT"
                              value={
                                summary.firstSummaryTax.nationalHousingTrust
                              }
                              negative
                            />
                            <MoneyRow
                              label="Education Tax"
                              value={summary.firstSummaryTax.educationTax}
                              negative
                            />
                            <MoneyRow
                              label="Income Tax"
                              value={summary.firstSummaryTax.incomeTax}
                              negative
                            />
                            <MoneyRow
                              label="JTA dues"
                              value={summary.firstSummaryTax.jtaTax}
                              negative
                            />
                            <MoneyRow
                              label="Pension"
                              value={summary.firstSummaryTax.pension}
                              negative
                            />
                            <Divider sx={{ my: 1 }} />
                            <MoneyRow
                              label="Total deductions"
                              value={summary.firstSummaryTax.totalTaxes}
                              negative
                              strong
                            />
                            <MoneyRow
                              label="Net pay (monthly)"
                              value={summary.firstSummaryTax.netPay}
                              strong
                            />
                          </Grid>

                          {/* Revised */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              Revised — {summary.completedFinancialYears}{' '}
                              completed financial year
                              {summary.completedFinancialYears === 1 ? '' : 's'}
                            </Typography>

                            {!summary.hasRevisedSalary ? (
                              <Alert severity="info">
                                No revised salary applies yet (no completed
                                financial years, or already at the top point of
                                the band).
                              </Alert>
                            ) : (
                              <>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    py: 0.75,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    Revised point
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    Point {summary.revisedPoint}
                                  </Typography>
                                </Box>
                                <MoneyRow
                                  label="Revised salary (monthly)"
                                  value={summary.revisedSalaryMonthly}
                                  strong
                                />

                                {summary.secondSummaryTax && (
                                  <>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ mt: 2, mb: 1 }}
                                    >
                                      Deductions on revised salary (monthly)
                                    </Typography>
                                    <MoneyRow
                                      label="NIS"
                                      value={
                                        summary.secondSummaryTax
                                          .nationalInsurance
                                      }
                                      negative
                                    />
                                    <MoneyRow
                                      label="NHT"
                                      value={
                                        summary.secondSummaryTax
                                          .nationalHousingTrust
                                      }
                                      negative
                                    />
                                    <MoneyRow
                                      label="Education Tax"
                                      value={
                                        summary.secondSummaryTax.educationTax
                                      }
                                      negative
                                    />
                                    <MoneyRow
                                      label="Income Tax"
                                      value={summary.secondSummaryTax.incomeTax}
                                      negative
                                    />
                                    <MoneyRow
                                      label="JTA dues"
                                      value={summary.secondSummaryTax.jtaTax}
                                      negative
                                    />
                                    <MoneyRow
                                      label="Pension"
                                      value={summary.secondSummaryTax.pension}
                                      negative
                                    />
                                    <Divider sx={{ my: 1 }} />
                                    <MoneyRow
                                      label="Total deductions"
                                      value={
                                        summary.secondSummaryTax.totalTaxes
                                      }
                                      negative
                                      strong
                                    />
                                    <MoneyRow
                                      label="Net pay (monthly)"
                                      value={summary.secondSummaryTax.netPay}
                                      strong
                                    />
                                  </>
                                )}
                              </>
                            )}
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* School card (school-linked teachers only) */}
            {user_type === 4 && school && (
              <Grid item xs={12} md={8} sx={{ ml: 'auto' }}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        component={Icon}
                        icon={homeFill}
                        sx={{ width: 22, height: 22, color: 'text.secondary' }}
                      />
                      <Box>
                        <Typography variant="subtitle2">
                          {school.school_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {school.location}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      sx={{ mt: 2 }}
                      size="small"
                      onClick={() =>
                        navigate(PATH_DASHBOARD.general.teacherTimetable)
                      }
                    >
                      View my classes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Page>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        component={Icon}
        icon={icon}
        sx={{ width: 22, height: 22, color: 'text.secondary' }}
      />
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  )
}

function ReadRow({ label, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Grid>
  )
}

function MoneyRow({ label, value, negative, strong }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 'bold' : 500 }}>
        {negative && value ? '-' : ''}
        {fmt(value)}
      </Typography>
    </Box>
  )
}
