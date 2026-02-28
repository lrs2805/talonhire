
import React from 'react';
import { useTranslation } from 'react-i18next';

export function LocalizedDate({ date, options = { year: 'numeric', month: 'long', day: 'numeric' } }) {
  const { i18n } = useTranslation();
  const formatted = new Intl.DateTimeFormat(i18n.language, options).format(new Date(date));
  return <span>{formatted}</span>;
}

export function LocalizedCurrency({ amount, currency = 'USD' }) {
  const { i18n } = useTranslation();
  const formatted = new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amount);
  return <span>{formatted}</span>;
}

export function LocalizedNumber({ number, options = {} }) {
  const { i18n } = useTranslation();
  const formatted = new Intl.NumberFormat(i18n.language, options).format(number);
  return <span>{formatted}</span>;
}
