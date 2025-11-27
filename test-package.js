import { getCountries } from '@yusifaliyevpro/countries';

console.log('Testing @yusifaliyevpro/countries...');

async function test() {
    try {
        // The package seems to require an object as the first argument based on previous error
        const countries = await getCountries({});
        console.log('Success!');
        console.log('Total countries:', countries?.length);
        if (countries && countries.length > 0) {
            console.log('Sample:', countries[0].name);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
