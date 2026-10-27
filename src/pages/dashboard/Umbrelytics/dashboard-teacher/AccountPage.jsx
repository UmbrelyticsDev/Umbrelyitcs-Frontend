import { useState, useEffect } from 'react'
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
  LinearProgress,
} from '@material-ui/core'
import { Icon } from '@iconify/react'
import personFill from '@iconify/icons-eva/person-fill'
import emailFill from '@iconify/icons-eva/email-fill'
import awardFill from '@iconify/icons-eva/award-fill'
import calendarFill from '@iconify/icons-eva/calendar-fill'
import homeFill from '@iconify/icons-eva/home-fill'
import Page from '../../../../components/Page'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const user_type = JSON.parse(localStorage.getItem('user_type'))

const fmtDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d
  }
}

const fmtMoney = (amount, currency = 'USD') =>
  Number(amount) > 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
        amount,
      )
    : 'Free'

const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

export default function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const teacherId = user?.teacherId

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await axios.get(
          `${REST_API_END_POINT}account/summary/${teacherId}?userType=${user_type}`,
        )
        if (res.data?.status === 1 && res.data?.result) {
          setData(res.data.result)
        } else {
          setError(res.data?.message || 'Could not load your account.')
        }
      } catch (e) {
        console.error('Account load failed:', e)
        setError('Could not load your account.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const creditPct =
    data?.credits?.allowance > 0
      ? Math.min(
          100,
          Math.round((data.credits.used / data.credits.allowance) * 100),
        )
      : 0

  return (
    <Page title="Account | Umbrelytics">
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4">Account</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your plan, credits, and billing
          </Typography>
        </Box>

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

        {!loading && !error && data && (
          <Grid container spacing={3}>
            {/* Identity */}
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2 }}>
                  {(data.account.name || 'T').charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5">{data.account.name}</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  {data.account.role}
                </Typography>
                <Chip label={`${data.account.type} account`} size="small" />
              </Card>
            </Grid>

            {/* Account details */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Account details
                  </Typography>
                  <Stack spacing={2.5}>
                    <InfoRow
                      icon={personFill}
                      label="Account name"
                      value={data.account.name}
                    />
                    <InfoRow
                      icon={emailFill}
                      label="Email"
                      value={data.account.email}
                    />
                    <InfoRow
                      icon={awardFill}
                      label="Account type"
                      value={`${data.account.type} — ${data.account.role}`}
                    />
                    <InfoRow
                      icon={calendarFill}
                      label="Member since"
                      value={fmtDate(data.account.memberSince)}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Plan */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="h6">Plan</Typography>
                    <Chip
                      label={data.plan.name || '—'}
                      color="primary"
                      size="small"
                    />
                  </Stack>

                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                    {fmtMoney(data.plan.priceMonthly, data.plan.currency)}
                    {Number(data.plan.priceMonthly) > 0 && (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {' '}
                        /month
                      </Typography>
                    )}
                  </Typography>
                  {!data.billing.billingEnabled && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Not billed yet — free during early access
                    </Typography>
                  )}

                  {data.plan.inherited && data.school && (
                    <Alert
                      severity="info"
                      icon={<Box component={Icon} icon={homeFill} />}
                      sx={{ mt: 2 }}
                    >
                      Provided by {data.school.name}
                    </Alert>
                  )}

                  {Array.isArray(data.plan.features) &&
                    data.plan.features.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        {data.plan.features.map((f) => (
                          <Stack
                            key={f}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ py: 0.4 }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                              }}
                            />
                            <Typography variant="body2">{f}</Typography>
                          </Stack>
                        ))}
                      </Box>
                    )}

                  {/* Independent accounts manage their own plan; school teachers inherit it. */}
                  {!data.plan.inherited && (
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled
                      sx={{ mt: 3 }}
                    >
                      Upgrade plan (coming soon)
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Credits */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Monthly credits
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      {data.credits.remaining} of {data.credits.allowance}{' '}
                      remaining
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {data.credits.used} used
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={creditPct}
                    sx={{ height: 10, borderRadius: 5 }}
                  />

                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}
                  >
                    Resets on {fmtDate(data.billing.nextChargeDate)}
                  </Typography>

                  {data.plan.inherited && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mt: 0.5,
                      }}
                    >
                      Credits are shared across your school.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Billing */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Billing
                  </Typography>

                  {data.plan.inherited ? (
                    <Alert severity="info">
                      Billing is managed by your school
                      {data.school?.name ? ` (${data.school.name})` : ''}.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      <ReadRow
                        label="Status"
                        value={titleCase(data.billing.status)}
                      />
                      <ReadRow
                        label="Current period started"
                        value={fmtDate(data.billing.currentPeriodStart)}
                      />
                      <ReadRow
                        label="Next charge due"
                        value={fmtDate(data.billing.nextChargeDate)}
                      />
                      <ReadRow
                        label="Amount"
                        value={fmtMoney(
                          data.plan.priceMonthly,
                          data.plan.currency,
                        )}
                      />
                    </Grid>
                  )}

                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Billing history
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No charges yet.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
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
        <Typography variant="body2">{value || '—'}</Typography>
      </Box>
    </Stack>
  )
}

function ReadRow({ label, value }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Grid>
  )
}
