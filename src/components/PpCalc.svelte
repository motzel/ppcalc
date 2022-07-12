<script>
  import Badge from './Badge.svelte'
  import {debounce} from '../utils/debounce'
  import {formatNumber} from '../utils/format'
  import {
    accFromPpFactor,
    calcPpBoundary,
    getPpFromAccAndStars,
    getWhatIfScore,
    PP_PER_STAR,
    ppFactorFromAcc,
  } from '../utils/pp'
  import Value from './Value.svelte'

  export let scores = null;
  export let service = 'scoresaber';

  const DEBOUNCE_THRESHOLD = 300;
  const ACC_THRESHOLDS = [92, 93, 94, 95, 96, 97, 98, 99];
  const DEFAULT_ACC = 95;

  let maxStars = 15;
  let maxPp = 100;

  let ppValue = 1;
  let stars = 10;
  let accuracy = DEFAULT_ACC;
  let lastCalculatedPpValue = 0;
  let rawPp = null;
  let isCalculating = true;

  async function calcOnePpBoundary(scores, ppValue) {
    if (!scores?.length || !Number.isFinite(ppValue)) {
      rawPp = null;
      return;
    }

    isCalculating = true;
    rawPp = calcPpBoundary(scores, ppValue);
    isCalculating = false;

    lastCalculatedPpValue = ppValue;
  }

  async function calcPpFromStars(stars, acc) {
    const newRawPpFromStars = getPpFromAccAndStars(acc, stars, service);
    const whatIf = getWhatIfScore(scores, -1, newRawPpFromStars)?.diff ?? null;

    if (whatIf && !isNaN(whatIf)) ppValue = whatIf;
  }

  function getStarsForAcc(rawPp, acc) {
    return service === 'beatleader'
      ? rawPp / PP_PER_STAR / acc * 100
      : rawPp / PP_PER_STAR / ppFactorFromAcc(acc);
  }

  function getAccForStars(rawPp, stars) {
    return service === 'beatleader'
      ? rawPp / PP_PER_STAR / stars * 100
      : accFromPpFactor(rawPp / PP_PER_STAR / stars);
  }

  function calcStarsAndAccFromRawPp(rawPp) {
    let newStars = getStarsForAcc(rawPp, accuracy);
    if (newStars > maxStars) {
      newStars = maxStars;
      accuracy = getAccForStars(rawPp, newStars);
    }

    stars = newStars;
  }

  const debouncedPpCalc = debounce((scores, ppValue) => calcOnePpBoundary(scores, ppValue), DEBOUNCE_THRESHOLD);
  const onStarsPercentChange = debounce(() => calcPpFromStars(stars, accuracy), DEBOUNCE_THRESHOLD)

  async function resetCalc(scores) {
    if (!scores?.length || !maxStars) return;

    ppValue = 1;
    accuracy = DEFAULT_ACC;

    const whatIf = getWhatIfScore(
      scores, -1,
      getPpFromAccAndStars(100, maxStars, service),
    );
    if (whatIf) maxPp = whatIf.diff;
  }

  $: resetCalc(scores)
  $: debouncedPpCalc(scores, ppValue);
  $: calcStarsAndAccFromRawPp(rawPp);
</script>

<div class="pp-calc">
  <section>
      <Badge
        label={`+ ${formatNumber(ppValue)}pp`}
        title={`Determines how many raw PPs in the new play you need to achieve to increase your total PP by ${formatNumber(ppValue)}pp`}
        value={isCalculating || lastCalculatedPpValue !== ppValue ? 'Calculating...' : rawPp}
        type={isCalculating || lastCalculatedPpValue !== ppValue ? 'text' : 'number'}
        digits={2}
        suffix=" raw pp new play"
        fluid={true}
        bgColor="var(--ppColour)"
      />

    {#if Number.isFinite(rawPp)}
      <div>
        <div>
          <div>
            <label>Desired +PP</label>

            <div class="range">
              <input type="range" min="1" max={maxPp} step="0.5" bind:value={ppValue}/>
              <span><Value value={ppValue} suffix="pp" withZeroSuffix={true}/></span>
            </div>
          </div>

          <div>
            <label>Accuracy</label>

            <div class="range">
              <input type="range" min="70" max="100" step="0.1" bind:value={accuracy} on:input={onStarsPercentChange}/>
              <span><Value value={accuracy} suffix="%" withZeroSuffix={true}/></span>
            </div>
          </div>

          <div>
            <label>Stars</label>

            <div class="range">
              <input type="range" min="0.1" max={maxStars} step="0.01" bind:value={stars}
                     on:input={onStarsPercentChange}/>
              <span><Value value={stars} suffix="*" withZeroSuffix={true}/></span>
            </div>
          </div>
        </div>

        <div>
          <table>
            <thead>
            <tr>
              {#each ACC_THRESHOLDS as threshold (threshold)}
                <th>{threshold}%</th>
              {/each}
            </tr>
            </thead>

            <tbody>
            <tr>
              {#each ACC_THRESHOLDS as threshold (threshold)}
                <td><Value value={ getStarsForAcc(rawPp, threshold) } suffix="*" /></td>
              {/each}
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </section>
</div>

<style>
    section {
        width: 32rem;
        max-width: 32rem;
    }
    .range {
        display: inline-flex;
    }

    .range > *:first-child {
        margin-right: .5em;
    }

    label {
        display: block;
        font-size: .875em;
        font-weight: normal;
        color: var(--faded) !important;
    }

    input {
        width: 18.75em;
        max-width: 23em;
    }

    table {
        width: 100%;
    }

    table thead {
        border-bottom: solid 2px var(--dimmed);
    }

    table th, table td {
        text-align: center;
    }

    div :global(section) {
        padding-left: 0 !important;
        padding-right: 0 !important;
    }

    div :global(section > h3) {
        padding-left: 0 !important;
        padding-right: 0 !important;
    }

    @media screen and (max-width: 767px) {
        .pp-calc {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        section {
            text-align: center;
        }
    }

    @media screen and (max-width: 449px) {
        table tbody {
            font-size: .875em;
        }
    }
</style>