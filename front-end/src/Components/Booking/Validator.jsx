export const validateName = (value) => {
  if (!value) return "Name is required";
  if (value.trim().length < 3)
    return "Name must be at least 3 characters";
  return "";
};

export const validatePhone = (value) => {
  if (!value) return "Phone number is required";
  if (!/^\d{10}$/.test(value))
    return "Phone number must be 10 digits";
  return "";
};

export const validateEmail = (value) => {
  if (!value) return "";
  const pattern =
    /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return pattern.test(value) ? "" : "Invalid email address";
};


export const validateReferralName = (value) => {
  if (!value) return "";
  if (value.trim().length < 3)
    return "Referral name must be at least 3 characters";
  return "";
};

export const validateReferralPhone = (value) => {
  if (!value) return "";
  if (!/^\d{10}$/.test(value))
    return "Referral phone must be 10 digits";
  return "";
};

export const validateReferralEmail = (value) => {
  if (!value) return "";
  const pattern =
    /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  return pattern.test(value) ? "" : "Invalid email address";
};
