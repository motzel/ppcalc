<script>
	import {dateFromString, formatDate, formatDateRelative, isValidDate} from '../utils/date';

	export let date = new Date();
	export let prevDate = null;
	export let noDate = '';
	export let prevPrefix = '';
	export let absolute = false;

	$: dateObj = isValidDate(date) ? date : dateFromString(date);
	$: dateTitle = dateObj && !absolute ? formatDate(dateObj) : null;
	$: formatted = dateObj ? (absolute ? formatDate(dateObj) : formatDateRelative(dateObj)) : noDate;
	$: prevDateObj = prevDate ? (isValidDate(prevDate) ? prevDate : dateFromString(date)) : null;
	$: prevDateTitle = prevDateObj && !absolute ? formatDate(prevDateObj) : null;
	$: prevFormatted = prevDateObj ? (absolute ? formatDate(prevDateObj) : formatDateRelative(prevDateObj)) : '';
</script>

<span title={dateTitle}>{formatted}</span>{#if prevDateObj}<small title={prevDateTitle}>{prevPrefix}{prevFormatted}</small>{/if}

<style>
	small {
		display: block;
		color: var(--faded);
	}
</style>
