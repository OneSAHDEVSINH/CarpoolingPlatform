import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip,
  Snackbar,
  Avatar,
  Alert
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  ArrowUpward,
  ArrowDownward,
  Payment,
  CheckCircle,
  AccountCircle
} from '@mui/icons-material';
import mockApi from '../../services/api';

const Wallet = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tripId = searchParams.get('trip');
  const amountToPay = parseFloat(searchParams.get('amount') || '0');

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [openRecharge, setOpenRecharge] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });
  const [processing, setProcessing] = useState(false);

  const fetchWalletDetails = async () => {
    try {
      const balanceRes = await mockApi.wallet.balance();
      setBalance(balanceRes?.data?.balance || 0);
      const transRes = await mockApi.wallet.transactions();
      setTransactions(transRes?.data?.transactions || []);
    } catch (err) {
      console.error('Wallet fetch error:', err);
      setBalance(0);
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleRecharge = async (e) => {
    e.preventDefault();
    const amt = parseFloat(rechargeAmt);
    if (isNaN(amt) || amt <= 0) return;

    setProcessing(true);
    try {
      const { data } = await mockApi.wallet.recharge(amt);
      setBalance(data.balance);
      setTransactions([
        {
          id: Date.now().toString(),
          type: 'credit',
          amount: amt,
          description: 'Wallet Recharge',
          created_at: new Date().toISOString()
        },
        ...transactions
      ]);
      setOpenRecharge(false);
      setToast({ open: true, msg: `₹${amt} added successfully!`, severity: 'success' });
    } catch (err) {
      setToast({ open: true, msg: 'Recharge failed', severity: 'error' });
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayTrip = async () => {
    if (balance < amountToPay) {
      setToast({ open: true, msg: 'Insufficient wallet balance. Recharge first!', severity: 'error' });
      return;
    }

    setProcessing(true);
    try {
      const { data } = await mockApi.wallet.pay({ booking_id: tripId, amount: amountToPay });
      setBalance(data.balance);
      setTransactions([{
        id: Date.now().toString(),
        type: 'debit',
        amount: amountToPay,
        description: `Ride Payment - Trip ID #${tripId.slice(0, 4)}`,
        created_at: new Date().toISOString()
      }, ...transactions]);
      
      setToast({ open: true, msg: 'Trip payment completed!', severity: 'success' });
      setProcessing(false);
      navigate('/ride-history');
    } catch (err) {
      setToast({ open: true, msg: 'Payment failed', severity: 'error' });
      setProcessing(false);
      console.error(err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" fontWeight={800} color="primary" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWallet /> My Digital Wallet
      </Typography>

      {/* Conditional Trip Payment Checkout Prompt */}
      {tripId && amountToPay > 0 && (
        <Card
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3.5,
            border: '2px solid',
            borderColor: 'primary.main',
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #E0F7F3 0%, #FFFFFF 100%)'
                : 'linear-gradient(135deg, #0A2F2B 0%, #1E1E1E 100%)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment /> Trip Payment Checkout
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You have a pending payment of <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>₹{amountToPay}</Box> for Trip #{tripId.slice(0, 5)}. Please confirm to settle balance.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
              <Button
                variant="contained"
                onClick={handlePayTrip}
                disabled={processing}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,191,166,0.2)'
                }}
              >
                Pay ₹{amountToPay} Now
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      <Grid container spacing={4}>
        {/* Wallet Balance Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 4,
              borderRadius: 4,
              color: 'white',
              background: 'linear-gradient(135deg, #3F51B5 0%, #00BFA6 100%)',
              boxShadow: '0 8px 24px rgba(63,81,181,0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 220
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.85, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Wallet Balance
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mt: 1 }}>
                ₹{balance.toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenRecharge(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2.5,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 700,
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
              }}
            >
              Recharge Balance
            </Button>
          </Card>
        </Grid>

        {/* Transaction History Log */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Transaction Log
            </Typography>
            
            <List sx={{ maxHeight: 350, overflowY: 'auto' }}>
              {transactions.map((t, idx) => (
                <Box key={t.id || idx}>
                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: t.type === 'credit' ? 'success.light' : 'error.light', color: t.type === 'credit' ? 'success.main' : 'error.main' }}>
                        {t.type === 'credit' ? <ArrowDownward /> : <ArrowUpward />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={600}>{t.description}</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary">{new Date(t.created_at).toLocaleDateString()}</Typography>}
                    />
                    <Typography variant="subtitle2" fontWeight={800} color={t.type === 'credit' ? 'success.main' : 'error.main'}>
                      {t.type === 'credit' ? '+' : '-'}₹{Math.abs(t.amount)}
                    </Typography>
                  </ListItem>
                  {idx < transactions.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Recharge Modal Dialog */}
      <Dialog open={openRecharge} onClose={() => setOpenRecharge(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <form onSubmit={handleRecharge}>
          <DialogTitle sx={{ fontWeight: 700 }}>Recharge Wallet Balance</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                type="number"
                label="Enter Amount (₹)"
                required
                value={rechargeAmt}
                onChange={(e) => setRechargeAmt(e.target.value)}
              />
              
              {/* Preset buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[100, 250, 500, 1000].map((amt) => (
                  <Chip
                    key={amt}
                    label={`+ ₹${amt}`}
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={() => setRechargeAmt(amt.toString())}
                    sx={{ fontWeight: 600, py: 2, borderRadius: 2 }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenRecharge(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={processing} sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}>
              Recharge
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Wallet;
