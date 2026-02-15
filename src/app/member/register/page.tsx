'use client';
import { useState } from 'react';
import Link from 'next/link';

interface MemberData {
  MemName?: string;
  MemMembershipNo?: string;
  MemFatherName?: string;
  MemCNIC?: string;
  MemDOB?: string;
  MemComputerID?: unknown; // Keeping unknown for ID to avoid bigint issues for now, or string/number
}

interface RegistrationFormData {
  membershipNo: string;
  cnic: string;
  email: string;
  phone: string;
  memberData: MemberData | null;
  emailVerified: boolean;
}

// Step 1: Initial verification with membership details
function Step1_Verification({ onNext, formData, setFormData }: { onNext: () => void, formData: RegistrationFormData, setFormData: (data: RegistrationFormData) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('membership');

  const handleVerify = async () => {
    setError('');
    setLoading(true);

    try {
      const payload: {
        verificationMethod: string;
        email: string;
        phone: string;
        membershipNo?: string;
        cnic?: string;
      } = {
        verificationMethod,
        email: formData.email,
        phone: formData.phone
      };

      if (verificationMethod === 'membership') {
        payload.membershipNo = formData.membershipNo;
      } else if (verificationMethod === 'cnic') {
        payload.cnic = formData.cnic;
      }

      const response = await fetch('/api/member/get-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, memberData: data as MemberData });
        onNext();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Verification failed. Please check your details.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = formData.email && formData.phone &&
    ((verificationMethod === 'membership' && formData.membershipNo) ||
      (verificationMethod === 'cnic' && formData.cnic));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Membership</h2>
        <p className="text-gray-600 text-sm">Confirm you&apos;re a registered member</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 text-lg mr-2">⚠</span>
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Verification Method Selection */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Verification Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setVerificationMethod('membership')}
            className={`p-3 border-2 rounded-xl font-bold text-xs transition-all duration-200 ${verificationMethod === 'membership'
              ? 'border-[#038DCD] bg-[#038DCD]/5 text-[#038DCD]'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
          >
            <div className="text-xl mb-1">🎫</div>
            Membership
          </button>
          <button
            onClick={() => setVerificationMethod('cnic')}
            className={`p-3 border-2 rounded-xl font-bold text-xs transition-all duration-200 ${verificationMethod === 'cnic'
              ? 'border-[#038DCD] bg-[#038DCD]/5 text-[#038DCD]'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
          >
            <div className="text-xl mb-1">🆔</div>
            CNIC
          </button>
        </div>
      </div>

      {/* Membership/CNIC Input */}
      {verificationMethod === 'membership' && (
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Membership Number
          </label>
          <input
            type="text"
            value={formData.membershipNo}
            onChange={(e) => setFormData({ ...formData, membershipNo: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all text-sm"
            placeholder="Enter membership number"
          />
        </div>
      )}

      {verificationMethod === 'cnic' && (
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            CNIC Number
          </label>
          <input
            type="text"
            value={formData.cnic}
            onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all text-sm"
            placeholder="XXXXX-XXXXXXX-X"
          />
        </div>
      )}

      {/* Email Input */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all text-sm"
          placeholder="your.email@example.com"
        />
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all text-sm"
          placeholder="+92 XXX XXXXXXX"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleVerify}
        disabled={loading || !canSubmit}
        className="w-full bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-wide text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Verifying...
          </span>
        ) : (
          'Verify & Continue'
        )}
      </button>
    </div>
  );
}

// Step 2: Confirm member details
function Step2_ConfirmDetails({ onNext, onBack, formData }: { onNext: () => void, onBack: () => void, formData: RegistrationFormData }) {
  const memberData = formData.memberData || {} as MemberData;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Details</h2>
        <p className="text-gray-600 text-sm">Verify this information is correct</p>
      </div>

      {/* Success Alert */}
      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg">
        <div className="flex items-start">
          <span className="text-green-500 text-lg mr-2">✓</span>
          <p className="text-xs text-green-700 font-semibold">Member found! Please confirm the details below.</p>
        </div>
      </div>

      {/* Member Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Full Name</p>
          <p className="font-bold text-gray-900 text-sm">{memberData.MemName || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Membership No.</p>
          <p className="font-bold text-gray-900 text-sm">{memberData.MemMembershipNo || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Father&apos;s Name</p>
          <p className="font-bold text-gray-900 text-sm">{memberData.MemFatherName || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">CNIC</p>
          <p className="font-bold text-gray-900 text-sm">{memberData.MemCNIC || 'N/A'}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mb-1">Date of Birth</p>
          <p className="font-bold text-gray-900 text-sm">
            {memberData.MemDOB ? new Date(memberData.MemDOB).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#038DCD]/5 to-[#03BDCD]/5 rounded-xl p-3 border-2 border-[#038DCD]/30">
          <p className="text-[10px] text-[#038DCD] font-bold uppercase tracking-wide mb-1">Email (to be linked)</p>
          <p className="font-bold text-gray-900 text-sm">{formData.email}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-full transition-all duration-200 uppercase tracking-wide text-sm"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] uppercase tracking-wide text-sm"
        >
          Confirm →
        </button>
      </div>
    </div>
  );
}

// Step 3: Email verification
function Step3_EmailVerification({ onNext, onBack, formData, setFormData }: { onNext: () => void, onBack: () => void, formData: RegistrationFormData, setFormData: (data: RegistrationFormData) => void }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const sendVerificationCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (response.ok) {
        setCodeSent(true);
        setResendTimer(60);
        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError('Failed to send verification code.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode
        })
      });

      if (response.ok) {
        setFormData({ ...formData, emailVerified: true });
        onNext();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600 text-sm">We&apos;ll send a code to <span className="font-bold text-[#038DCD]">{formData.email}</span></p>
      </div>

      {!codeSent ? (
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F9C856]/20 to-[#F9D98F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📧</span>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Click below to receive a verification code.
          </p>
          <button
            onClick={sendVerificationCode}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 uppercase tracking-wide text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </span>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-500 text-lg mr-2">⚠</span>
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg">
            <div className="flex items-start">
              <span className="text-green-500 text-lg mr-2">✓</span>
              <p className="text-xs text-green-700 font-semibold">Code sent! Check your inbox.</p>
            </div>
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide text-center">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all text-center text-2xl tracking-[0.5em] font-bold"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          {/* Verify Button */}
          <button
            onClick={verifyCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 uppercase tracking-wide text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-xs text-gray-600">
                Resend in <span className="font-bold text-[#038DCD]">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={sendVerificationCode}
                className="text-xs text-[#038DCD] hover:text-[#038DCD]/80 font-bold"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full text-gray-600 hover:text-gray-900 font-semibold text-xs"
      >
        ← Back to previous step
      </button>
    </div>
  );
}

// Step 4: Create password
function Step4_CreatePassword({ onNext, onBack, formData }: { onNext: () => void, onBack: () => void, formData: RegistrationFormData }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const textColors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600'];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '',
      textColor: textColors[strength - 1] || ''
    };
  };

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberComputerId: formData.memberData?.MemComputerID,
          email: formData.email,
          phone: formData.phone,
          password: password
        })
      });

      if (response.ok) {
        onNext();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Password</h2>
        <p className="text-gray-600 text-sm">Choose a strong password</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 text-lg mr-2">⚠</span>
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Password Input */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all text-sm"
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${(strength.strength / 4) * 100}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${strength.textColor} uppercase tracking-wide min-w-[50px]`}>
                {strength.label}
              </span>
            </div>
            <p className="text-[10px] text-gray-600">
              Use 8+ characters with letters, numbers & symbols
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password Input */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
          Confirm Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all text-sm"
          placeholder="Re-enter password"
        />
        {confirmPassword && (
          <p className={`text-[10px] mt-1.5 font-semibold ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
            {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-full transition-all duration-200 uppercase tracking-wide text-sm"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || password !== confirmPassword || password.length < 8}
          className="flex-1 bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 uppercase tracking-wide text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating...
            </span>
          ) : (
            'Complete'
          )}
        </button>
      </div>
    </div>
  );
}

// Step 5: Success
function Step5_Success() {
  return (
    <div className="space-y-5 text-center">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
        <span className="text-5xl text-white">✓</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registration Complete!
        </h2>
        <p className="text-gray-600 text-sm">
          Your account has been successfully created.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/member/login"
          className="block w-full bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] uppercase tracking-wide text-sm"
        >
          Go to Login
        </Link>
        <Link
          href="/"
          className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-full transition-all duration-200 uppercase tracking-wide text-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

// Main Registration Component
export default function MemberRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    membershipNo: '',
    cnic: '',
    email: '',
    phone: '',
    memberData: null,
    emailVerified: false
  });

  const steps = [
    { number: 1, label: 'Verify', icon: '🎫' },
    { number: 2, label: 'Confirm', icon: '✓' },
    { number: 3, label: 'Email', icon: '📧' },
    { number: 4, label: 'Password', icon: '🔒' },
    { number: 5, label: 'Done', icon: '✓' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">

          {/* Left Sidebar - Progress */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#038DCD] to-[#03BDCD] p-8 lg:p-10">
            {/* Logo and Header */}
            <Link href="/" className="inline-block mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JWMJ</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl italic">Member Portal</h1>
                  <p className="text-white/80 text-xs font-medium">Registration</p>
                </div>
              </div>
            </Link>

            {/* Progress Steps */}
            <div className="space-y-4">
              {steps.map((s, idx) => (
                <div key={s.number} className="relative">
                  <div className="flex items-center gap-4">
                    {/* Step Circle */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-lg ${s.number < step
                        ? 'bg-white text-green-600'
                        : s.number === step
                          ? 'bg-white text-[#038DCD] scale-110'
                          : 'bg-white/20 text-white/60'
                        }`}
                    >
                      {s.number < step ? '✓' : s.icon}
                    </div>

                    {/* Step Label */}
                    <div className="flex-1">
                      <p
                        className={`font-bold text-sm uppercase tracking-wide ${s.number <= step ? 'text-white' : 'text-white/50'
                          }`}
                      >
                        {s.label}
                      </p>
                      <p
                        className={`text-xs ${s.number === step ? 'text-white/90' : 'text-white/40'
                          }`}
                      >
                        Step {s.number} of 5
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div className="ml-5 h-8 w-0.5 bg-white/20 mt-2"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Help Text */}
            <div className="mt-10 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-white/90 text-xs font-medium mb-1">Need Help?</p>
              <p className="text-white/70 text-xs">
                Contact support at <span className="font-bold">support@jwmj.com</span>
              </p>
            </div>
          </div>

          {/* Right Side - Form Content */}
          <div className="lg:col-span-3 p-8 lg:p-10 flex items-center">
            <div className="w-full max-w-lg mx-auto">
              {step === 1 && (
                <Step1_Verification
                  onNext={() => setStep(2)}
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {step === 2 && (
                <Step2_ConfirmDetails
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                  formData={formData}
                />
              )}
              {step === 3 && (
                <Step3_EmailVerification
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {step === 4 && (
                <Step4_CreatePassword
                  onNext={() => setStep(5)}
                  onBack={() => setStep(3)}
                  formData={formData}
                />
              )}
              {step === 5 && <Step5_Success />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}